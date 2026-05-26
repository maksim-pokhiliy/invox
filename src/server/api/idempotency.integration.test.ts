import { NextResponse } from "next/server";

import { Prisma } from "@prisma/client";
import { createHash } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { TIME } from "@app/shared/config/config";
import { asUserId, type UserId } from "@app/shared/types/ids";

const { prisma } = await import("@app/server/db");
const { pruneExpiredIdempotencyKeys, withIdempotency } =
  await import("@app/server/api/idempotency");
const factories = await import("@app/test/factories");

const ENDPOINT = "POST /api/invoices/:id/payments";
const VALID_HEADER_KEY = "idem-key-12345678";
const PG_UNIQUE_VIOLATION = "P2002";
const HANDLER_DELAY_MS = 80;
const CACHED_STATUS = 201;
const REUSED_STATUS = 422;
const IN_PROGRESS_STATUS = 409;
const RESPONSE_BODY = { ok: true };

interface IdempotencyContext {
  userId: UserId;
  email: string;
}

async function seedUser(): Promise<IdempotencyContext> {
  const user = await factories.createUser(prisma);

  return { userId: asUserId(user.id), email: user.email };
}

function buildRequest(body: Record<string, unknown> = { amount: 100 }): Request {
  return new Request("https://app.test/api/invoices/inv-1/payments", {
    method: "POST",
    headers: { "Idempotency-Key": VALID_HEADER_KEY, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function buildContext() {
  return { params: Promise.resolve({ id: "inv-1" }) };
}

function successHandler() {
  return vi.fn().mockResolvedValue(NextResponse.json(RESPONSE_BODY, { status: CACHED_STATUS }));
}

let consoleError: ReturnType<typeof vi.spyOn> | undefined;

beforeAll(() => {
  consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
});

beforeEach(() => {
  consoleError?.mockClear();
});

afterAll(() => {
  consoleError?.mockRestore();
});

describe("withIdempotency caching behavior", () => {
  it("inserts a claim row, runs the handler once, and stores the cached response body for replay", async () => {
    const ctx = await seedUser();
    const handler = successHandler();
    const wrapped = withIdempotency(handler, { endpoint: ENDPOINT });

    const first = await wrapped(
      { id: ctx.userId, email: ctx.email },
      buildRequest(),
      buildContext()
    );

    expect(first.status).toBe(CACHED_STATUS);
    expect(handler).toHaveBeenCalledTimes(1);

    const claim = await prisma.idempotencyKey.findUniqueOrThrow({
      where: {
        userId_endpoint_key: { userId: ctx.userId, endpoint: ENDPOINT, key: VALID_HEADER_KEY },
      },
    });

    expect(claim.responseStatus).toBe(CACHED_STATUS);
    expect(claim.responseBody).toEqual(RESPONSE_BODY);

    const second = await wrapped(
      { id: ctx.userId, email: ctx.email },
      buildRequest(),
      buildContext()
    );

    expect(second.status).toBe(CACHED_STATUS);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("inserts the claim row BEFORE running the handler (claim-before-handler invariant)", async () => {
    const ctx = await seedUser();
    let claimAtHandlerEntry = 0;
    const handler = vi.fn(async () => {
      claimAtHandlerEntry = await prisma.idempotencyKey.count({
        where: { userId: ctx.userId, endpoint: ENDPOINT, key: VALID_HEADER_KEY },
      });

      return NextResponse.json(RESPONSE_BODY, { status: CACHED_STATUS });
    });
    const wrapped = withIdempotency(handler, { endpoint: ENDPOINT });

    await wrapped({ id: ctx.userId, email: ctx.email }, buildRequest(), buildContext());

    expect(claimAtHandlerEntry).toBe(1);
  });
});

describe("withIdempotency body-hash mismatch", () => {
  it("returns 422 IDEMPOTENCY_KEY_REUSED when the same key arrives with a different body within 24h", async () => {
    const ctx = await seedUser();
    const handler = successHandler();
    const wrapped = withIdempotency(handler, { endpoint: ENDPOINT });

    const first = await wrapped(
      { id: ctx.userId, email: ctx.email },
      buildRequest({ amount: 100 }),
      buildContext()
    );

    expect(first.status).toBe(CACHED_STATUS);

    const second = await wrapped(
      { id: ctx.userId, email: ctx.email },
      buildRequest({ amount: 999 }),
      buildContext()
    );
    const payload = (await second.json()) as { error: { code: string } };

    expect(second.status).toBe(REUSED_STATUS);
    expect(payload.error.code).toBe("IDEMPOTENCY_KEY_REUSED");
    expect(handler).toHaveBeenCalledTimes(1);
  });
});

describe("withIdempotency concurrent same-key serialization", () => {
  it("runs the handler exactly once and returns 409 IN_PROGRESS to the loser while the winner is mid-handler", async () => {
    const ctx = await seedUser();
    let runs = 0;
    const handler = vi.fn(async () => {
      runs += 1;
      await new Promise<void>((resolve) => setTimeout(resolve, HANDLER_DELAY_MS));

      return NextResponse.json(RESPONSE_BODY, { status: CACHED_STATUS });
    });
    const wrapped = withIdempotency(handler, { endpoint: ENDPOINT });

    const [resA, resB] = await Promise.all([
      wrapped({ id: ctx.userId, email: ctx.email }, buildRequest(), buildContext()),
      wrapped({ id: ctx.userId, email: ctx.email }, buildRequest(), buildContext()),
    ]);

    expect(runs).toBe(1);

    const statuses = [resA.status, resB.status];

    expect(statuses).toContain(CACHED_STATUS);
    expect(statuses).toContain(IN_PROGRESS_STATUS);
  });
});

describe("withIdempotency handler failure semantics", () => {
  it("deletes the claim row when the handler throws so the same key is retryable", async () => {
    const ctx = await seedUser();
    const error = new Error("handler boom");
    const failingHandler = vi.fn().mockRejectedValueOnce(error);
    const wrappedFailing = withIdempotency(failingHandler, { endpoint: ENDPOINT });

    await expect(
      wrappedFailing({ id: ctx.userId, email: ctx.email }, buildRequest(), buildContext())
    ).rejects.toBe(error);

    const claimsAfterThrow = await prisma.idempotencyKey.count({
      where: { userId: ctx.userId, endpoint: ENDPOINT, key: VALID_HEADER_KEY },
    });

    expect(claimsAfterThrow).toBe(0);

    const retryHandler = successHandler();
    const wrappedRetry = withIdempotency(retryHandler, { endpoint: ENDPOINT });
    const retry = await wrappedRetry(
      { id: ctx.userId, email: ctx.email },
      buildRequest(),
      buildContext()
    );

    expect(retry.status).toBe(CACHED_STATUS);
    expect(retryHandler).toHaveBeenCalledTimes(1);

    const claimsAfterRetry = await prisma.idempotencyKey.count({
      where: { userId: ctx.userId, endpoint: ENDPOINT, key: VALID_HEADER_KEY },
    });

    expect(claimsAfterRetry).toBe(1);
  });
});

describe("withIdempotency expired claim handling", () => {
  it("treats a claim row with expiresAt <= now as stale and lets a fresh request re-run the handler", async () => {
    const ctx = await seedUser();
    const stalePastDate = new Date(Date.now() - TIME.HOUR);

    await factories.createIdempotencyKey(prisma, {
      userId: ctx.userId,
      endpoint: ENDPOINT,
      key: VALID_HEADER_KEY,
      expiresAt: stalePastDate,
    });

    const handler = successHandler();
    const wrapped = withIdempotency(handler, { endpoint: ENDPOINT });

    const response = await wrapped(
      { id: ctx.userId, email: ctx.email },
      buildRequest(),
      buildContext()
    );

    expect(response.status).toBe(CACHED_STATUS);
    expect(handler).toHaveBeenCalledTimes(1);

    const claim = await prisma.idempotencyKey.findUniqueOrThrow({
      where: {
        userId_endpoint_key: { userId: ctx.userId, endpoint: ENDPOINT, key: VALID_HEADER_KEY },
      },
    });

    expect(claim.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it("prunes expired rows in bulk and does not touch live rows", async () => {
    const ctx = await seedUser();
    const past = new Date(Date.now() - TIME.HOUR);
    const future = new Date(Date.now() + TIME.HOUR);

    await factories.createIdempotencyKey(prisma, {
      userId: ctx.userId,
      endpoint: ENDPOINT,
      key: "expired-key-aaaaaaaaaaaaaaaa",
      expiresAt: past,
    });

    await factories.createIdempotencyKey(prisma, {
      userId: ctx.userId,
      endpoint: ENDPOINT,
      key: "live-key-bbbbbbbbbbbbbbbb",
      expiresAt: future,
    });

    const result = await pruneExpiredIdempotencyKeys(prisma, new Date());

    expect(result.deleted).toBe(1);

    const remaining = await prisma.idempotencyKey.count({ where: { userId: ctx.userId } });

    expect(remaining).toBe(1);
  });
});

describe("withIdempotency P2002 detection sanity check", () => {
  it("raises Prisma.PrismaClientKnownRequestError with code P2002 on the real unique constraint", async () => {
    const ctx = await seedUser();

    await factories.createIdempotencyKey(prisma, {
      userId: ctx.userId,
      endpoint: ENDPOINT,
      key: VALID_HEADER_KEY,
    });

    await expect(
      factories.createIdempotencyKey(prisma, {
        userId: ctx.userId,
        endpoint: ENDPOINT,
        key: VALID_HEADER_KEY,
      })
    ).rejects.toMatchObject({
      code: PG_UNIQUE_VIOLATION,
    });

    const lastError = await prisma.idempotencyKey
      .create({
        data: {
          userId: ctx.userId,
          endpoint: ENDPOINT,
          key: VALID_HEADER_KEY,
          requestHash: "x",
          responseBody: Prisma.DbNull,
          expiresAt: new Date(Date.now() + TIME.HOUR),
        },
      })
      .catch((err: unknown) => err);

    expect(lastError).toBeInstanceOf(Prisma.PrismaClientKnownRequestError);
  });
});

describe("withIdempotency — MT-013 IDEMPOTENCY_KEY_IN_PROGRESS deterministic branch", () => {
  it("returns 409 IDEMPOTENCY_KEY_IN_PROGRESS when a same-key claim row exists with responseStatus = null", async () => {
    const ctx = await seedUser();
    const body = { amount: 100 };
    const requestHash = createHash("sha256")
      .update(`POST:${JSON.stringify(body)}`)
      .digest("hex");

    await factories.createIdempotencyKey(prisma, {
      userId: ctx.userId,
      endpoint: ENDPOINT,
      key: VALID_HEADER_KEY,
      requestHash,
      responseStatus: null,
      responseBody: Prisma.DbNull,
    });

    const handler = successHandler();
    const wrapped = withIdempotency(handler, { endpoint: ENDPOINT });

    const response = await wrapped(
      { id: ctx.userId, email: ctx.email },
      buildRequest(body),
      buildContext()
    );
    const payload = (await response.json()) as { error: { code: string } };

    expect(response.status).toBe(409);
    expect(payload.error.code).toBe("IDEMPOTENCY_KEY_IN_PROGRESS");
    expect(handler).not.toHaveBeenCalled();
  });
});
