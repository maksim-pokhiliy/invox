import { NextResponse } from "next/server";

import { Prisma, type PrismaClient } from "@prisma/client";
import crypto from "node:crypto";

import { errorResponse } from "@app/server/api/route-helpers";
import { prisma } from "@app/server/db";
import { pruneArm } from "@app/server/prune/run";

const IDEMPOTENCY_HEADER = "Idempotency-Key";
const KEY_MIN_LENGTH = 8;
const KEY_MAX_LENGTH = 128;
const KEY_PATTERN = /^[\x21-\x7e]+$/;
const TTL_HOURS = 24;
const MS_PER_HOUR = 60 * 60 * 1000;
const PRISMA_UNIQUE_CONSTRAINT = "P2002";
const IN_PROGRESS_STATUS = 409;
const SUCCESS_STATUS_MIN = 200;
const SUCCESS_STATUS_MAX = 300;

type AuthUser = { id: string; email: string };

type RouteContext = { params: Promise<Record<string, string>> };

type AuthHandler = (
  user: AuthUser,
  request: Request,
  context: RouteContext
) => Promise<NextResponse>;

interface IdempotencyOptions {
  endpoint: string;
}

interface ClaimKey {
  userId: string;
  endpoint: string;
  key: string;
}

type ClaimRow = {
  id: string;
  requestHash: string;
  responseStatus: number | null;
  responseBody: Prisma.JsonValue | null;
  expiresAt: Date;
};

function isValidKey(value: string): boolean {
  if (value.length < KEY_MIN_LENGTH || value.length > KEY_MAX_LENGTH) {
    return false;
  }

  return KEY_PATTERN.test(value);
}

function hashRequest(method: string, body: string): string {
  return crypto.createHash("sha256").update(`${method}:${body}`).digest("hex");
}

function buildCachedResponse(status: number, body: Prisma.JsonValue): NextResponse {
  return NextResponse.json(body, { status });
}

function inProgressResponse(): NextResponse {
  return errorResponse(
    "IDEMPOTENCY_KEY_IN_PROGRESS",
    "A request with this Idempotency-Key is still being processed. Retry shortly.",
    IN_PROGRESS_STATUS
  );
}

function reusedResponse(): NextResponse {
  return errorResponse(
    "IDEMPOTENCY_KEY_REUSED",
    `${IDEMPOTENCY_HEADER} reused with a different request body`,
    422
  );
}

function isSuccessStatus(status: number): boolean {
  return status >= SUCCESS_STATUS_MIN && status < SUCCESS_STATUS_MAX;
}

function parseJsonInput(text: string): Prisma.InputJsonValue {
  if (text.length === 0) {
    return {};
  }

  try {
    return JSON.parse(text) as Prisma.InputJsonValue;
  } catch {
    return {};
  }
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === PRISMA_UNIQUE_CONSTRAINT
  );
}

async function readBody(request: Request): Promise<{ raw: string; clone: Request }> {
  const cloned = request.clone();
  const raw = await request.text();
  const replay = new Request(cloned.url, {
    method: cloned.method,
    headers: cloned.headers,
    body: raw.length > 0 ? raw : undefined,
  });

  return { raw, clone: replay };
}

function findClaim(claimKey: ClaimKey) {
  return prisma.idempotencyKey.findUnique({
    where: { userId_endpoint_key: claimKey },
  });
}

function releaseClaim(claimKey: ClaimKey) {
  return prisma.idempotencyKey.deleteMany({
    where: {
      userId: claimKey.userId,
      endpoint: claimKey.endpoint,
      key: claimKey.key,
    },
  });
}

async function readResponseBody(response: NextResponse): Promise<Prisma.InputJsonValue> {
  const rawText = await response.clone().text();

  return parseJsonInput(rawText);
}

function resolveExistingClaim(
  claim: ClaimRow,
  requestHash: string,
  now: Date
): NextResponse | null {
  if (claim.expiresAt <= now) {
    return null;
  }

  if (claim.requestHash !== requestHash) {
    return reusedResponse();
  }

  if (claim.responseStatus === null || claim.responseBody === null) {
    return inProgressResponse();
  }

  return buildCachedResponse(claim.responseStatus, claim.responseBody);
}

async function claimKeyOrResolveRacer(
  claimKey: ClaimKey,
  requestHash: string,
  now: Date
): Promise<NextResponse | null> {
  try {
    await prisma.idempotencyKey.create({
      data: {
        key: claimKey.key,
        userId: claimKey.userId,
        endpoint: claimKey.endpoint,
        requestHash,
        responseStatus: null,
        responseBody: Prisma.DbNull,
        expiresAt: new Date(now.getTime() + TTL_HOURS * MS_PER_HOUR),
      },
    });

    return null;
  } catch (error) {
    if (!isUniqueConstraintError(error)) {
      throw error;
    }

    const racing = await findClaim(claimKey);

    if (!racing) {
      return inProgressResponse();
    }

    return resolveExistingClaim(racing, requestHash, now) ?? inProgressResponse();
  }
}

async function completeClaim(
  claimKey: ClaimKey,
  handler: AuthHandler,
  user: AuthUser,
  request: Request,
  context: RouteContext
): Promise<NextResponse> {
  let response: NextResponse;

  try {
    response = await handler(user, request, context);
  } catch (error) {
    await releaseClaim(claimKey);
    throw error;
  }

  if (!isSuccessStatus(response.status)) {
    await releaseClaim(claimKey);

    return response;
  }

  await prisma.idempotencyKey.update({
    where: { userId_endpoint_key: claimKey },
    data: { responseStatus: response.status, responseBody: await readResponseBody(response) },
  });

  return response;
}

export function withIdempotency(handler: AuthHandler, options: IdempotencyOptions) {
  return async (user: AuthUser, request: Request, context: RouteContext) => {
    const key = request.headers.get(IDEMPOTENCY_HEADER);

    if (!key) {
      return errorResponse(
        "IDEMPOTENCY_KEY_REQUIRED",
        `${IDEMPOTENCY_HEADER} header is required for this endpoint`,
        400
      );
    }

    if (!isValidKey(key)) {
      return errorResponse(
        "IDEMPOTENCY_KEY_INVALID",
        `${IDEMPOTENCY_HEADER} must be ${KEY_MIN_LENGTH}-${KEY_MAX_LENGTH} ASCII characters`,
        400
      );
    }

    const { raw, clone } = await readBody(request);
    const requestHash = hashRequest(request.method, raw);
    const now = new Date();
    const claimKey: ClaimKey = { userId: user.id, endpoint: options.endpoint, key };

    const existing = await findClaim(claimKey);

    if (existing) {
      const resolved = resolveExistingClaim(existing, requestHash, now);

      if (resolved) {
        return resolved;
      }

      await prisma.idempotencyKey.deleteMany({
        where: { id: existing.id, expiresAt: { lte: now } },
      });
    }

    const racerResponse = await claimKeyOrResolveRacer(claimKey, requestHash, now);

    if (racerResponse) {
      return racerResponse;
    }

    return completeClaim(claimKey, handler, user, clone, context);
  };
}

const IDEMPOTENCY_TABLE = "IdempotencyKey";

export async function pruneExpiredIdempotencyKeys(
  client: PrismaClient,
  now: Date
): Promise<{ deleted: number }> {
  const deleted = await pruneArm({
    client,
    now,
    table: IDEMPOTENCY_TABLE,
    mode: "prune",
    run: async ({ client: c }) => {
      const result = await c.idempotencyKey.deleteMany({
        where: { expiresAt: { lte: now } },
      });

      return result.count;
    },
  });

  return { deleted };
}

export async function countExpiredIdempotencyKeys(
  client: PrismaClient,
  now: Date
): Promise<{ count: number }> {
  const count = await pruneArm({
    client,
    now,
    table: IDEMPOTENCY_TABLE,
    mode: "count",
    run: ({ client: c }) =>
      c.idempotencyKey.count({
        where: { expiresAt: { lte: now } },
      }),
  });

  return { count };
}
