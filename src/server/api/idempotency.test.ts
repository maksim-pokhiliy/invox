import { NextResponse } from "next/server";

import { Prisma } from "@prisma/client";
import { randomBytes } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { asUserId } from "@app/shared/types/ids";

const idempotencyKey = {
  findUnique: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  deleteMany: vi.fn(),
};

vi.mock("@app/server/db", () => ({
  prisma: { idempotencyKey },
}));

vi.mock("@app/server/api/route-helpers", () => ({
  errorResponse: (code: string, message: string, status: number) =>
    NextResponse.json({ error: { code, message } }, { status }),
}));

const ENDPOINT = "POST /api/invoices/:id/payments";
const VALID_HEADER_KEY = "idem-key-12345678";
const USER = { id: asUserId("user-1"), email: "owner@example.com" };
const FRESH_EXPIRY = new Date(Date.now() + 60_000);

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

function uniqueConstraintError(): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
    code: "P2002",
    clientVersion: "test",
  });
}

async function requestHashOf(request: Request): Promise<string> {
  const { createHash } = await import("node:crypto");

  return createHash("sha256")
    .update(`POST:${await request.clone().text()}`)
    .digest("hex");
}

async function loadWithIdempotency() {
  vi.resetModules();
  vi.stubEnv("DATABASE_URL", "postgresql://localhost:5432/test");
  vi.stubEnv("NEXTAUTH_SECRET", randomBytes(32).toString("base64"));

  const imported = await import("./idempotency");

  return imported.withIdempotency;
}

function successHandler() {
  return vi.fn().mockResolvedValue(NextResponse.json({ ok: true }, { status: 201 }));
}

beforeEach(() => {
  idempotencyKey.findUnique.mockReset();
  idempotencyKey.create.mockReset();
  idempotencyKey.update.mockReset();
  idempotencyKey.deleteMany.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("withIdempotency — QA-002 regression — claim-before-handler race", () => {
  it("runs the handler exactly once on the winning path that claims the key", async () => {
    const withIdempotency = await loadWithIdempotency();

    idempotencyKey.findUnique.mockResolvedValue(null);
    idempotencyKey.create.mockResolvedValue({ id: "claim-1" });
    idempotencyKey.update.mockResolvedValue({ id: "claim-1" });

    const handler = successHandler();
    const wrapped = withIdempotency(handler, { endpoint: ENDPOINT });

    const response = await wrapped(USER, buildRequest(), buildContext());

    expect(handler).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(201);
    expect(idempotencyKey.create).toHaveBeenCalledTimes(1);
    expect(idempotencyKey.update).toHaveBeenCalledTimes(1);
  });

  it("never runs the handler on the losing path when the claim INSERT hits P2002", async () => {
    const withIdempotency = await loadWithIdempotency();

    idempotencyKey.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce({
      id: "claim-1",
      requestHash: "irrelevant-winner-still-in-flight",
      responseStatus: null,
      responseBody: null,
      expiresAt: FRESH_EXPIRY,
    });
    idempotencyKey.create.mockRejectedValue(uniqueConstraintError());

    const handler = successHandler();
    const wrapped = withIdempotency(handler, { endpoint: ENDPOINT });

    await wrapped(USER, buildRequest(), buildContext());

    expect(handler).not.toHaveBeenCalled();
  });

  it("returns in-progress when the losing request finds the winner still claiming", async () => {
    const withIdempotency = await loadWithIdempotency();
    const loserRequest = buildRequest();

    idempotencyKey.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce({
      id: "claim-1",
      requestHash: await requestHashOf(loserRequest),
      responseStatus: null,
      responseBody: null,
      expiresAt: FRESH_EXPIRY,
    });
    idempotencyKey.create.mockRejectedValue(uniqueConstraintError());

    const handler = successHandler();
    const wrapped = withIdempotency(handler, { endpoint: ENDPOINT });

    const response = await wrapped(USER, loserRequest, buildContext());
    const payload = (await response.json()) as { error: { code: string } };

    expect(response.status).toBe(409);
    expect(payload.error.code).toBe("IDEMPOTENCY_KEY_IN_PROGRESS");
    expect(handler).not.toHaveBeenCalled();
  });

  it("replays the winner's cached response on the losing path once completed", async () => {
    const withIdempotency = await loadWithIdempotency();
    const loserRequest = buildRequest();

    idempotencyKey.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce({
      id: "claim-1",
      requestHash: await requestHashOf(loserRequest),
      responseStatus: 201,
      responseBody: { ok: true, replayed: true },
      expiresAt: FRESH_EXPIRY,
    });
    idempotencyKey.create.mockRejectedValue(uniqueConstraintError());

    const handler = successHandler();
    const wrapped = withIdempotency(handler, { endpoint: ENDPOINT });

    const response = await wrapped(USER, loserRequest, buildContext());
    const payload = (await response.json()) as { replayed?: boolean };

    expect(response.status).toBe(201);
    expect(payload.replayed).toBe(true);
    expect(handler).not.toHaveBeenCalled();
  });

  it("deletes the claim row when the handler throws so the key stays retryable", async () => {
    const withIdempotency = await loadWithIdempotency();

    idempotencyKey.findUnique.mockResolvedValue(null);
    idempotencyKey.create.mockResolvedValue({ id: "claim-1" });
    idempotencyKey.deleteMany.mockResolvedValue({ count: 1 });

    const failure = new Error("recordPayment blew up");
    const handler = vi.fn().mockRejectedValue(failure);
    const wrapped = withIdempotency(handler, { endpoint: ENDPOINT });

    await expect(wrapped(USER, buildRequest(), buildContext())).rejects.toThrow(failure);
    expect(idempotencyKey.deleteMany).toHaveBeenCalledTimes(1);
    expect(idempotencyKey.update).not.toHaveBeenCalled();
  });

  it("deletes the claim row when the handler returns a non-success response", async () => {
    const withIdempotency = await loadWithIdempotency();

    idempotencyKey.findUnique.mockResolvedValue(null);
    idempotencyKey.create.mockResolvedValue({ id: "claim-1" });
    idempotencyKey.deleteMany.mockResolvedValue({ count: 1 });

    const handler = vi
      .fn()
      .mockResolvedValue(NextResponse.json({ error: { code: "BAD_REQUEST" } }, { status: 400 }));
    const wrapped = withIdempotency(handler, { endpoint: ENDPOINT });

    const response = await wrapped(USER, buildRequest(), buildContext());

    expect(response.status).toBe(400);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(idempotencyKey.deleteMany).toHaveBeenCalledTimes(1);
    expect(idempotencyKey.update).not.toHaveBeenCalled();
  });
});

describe("withIdempotency — QA-002 regression — request-body and key validation", () => {
  it("rejects a same-key different-body request with 422 against an existing fresh claim", async () => {
    const withIdempotency = await loadWithIdempotency();

    idempotencyKey.findUnique.mockResolvedValue({
      id: "claim-1",
      requestHash: "hash-of-a-different-body",
      responseStatus: 201,
      responseBody: { ok: true },
      expiresAt: FRESH_EXPIRY,
    });

    const handler = successHandler();
    const wrapped = withIdempotency(handler, { endpoint: ENDPOINT });

    const response = await wrapped(USER, buildRequest({ amount: 999 }), buildContext());
    const payload = (await response.json()) as { error: { code: string } };

    expect(response.status).toBe(422);
    expect(payload.error.code).toBe("IDEMPOTENCY_KEY_REUSED");
    expect(handler).not.toHaveBeenCalled();
    expect(idempotencyKey.create).not.toHaveBeenCalled();
  });

  it("rejects a same-key different-body request with 422 while the winner is in flight", async () => {
    const withIdempotency = await loadWithIdempotency();

    idempotencyKey.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce({
      id: "claim-1",
      requestHash: "hash-of-the-winners-different-body",
      responseStatus: null,
      responseBody: null,
      expiresAt: FRESH_EXPIRY,
    });
    idempotencyKey.create.mockRejectedValue(uniqueConstraintError());

    const handler = successHandler();
    const wrapped = withIdempotency(handler, { endpoint: ENDPOINT });

    const response = await wrapped(USER, buildRequest({ amount: 1 }), buildContext());
    const payload = (await response.json()) as { error: { code: string } };

    expect(response.status).toBe(422);
    expect(payload.error.code).toBe("IDEMPOTENCY_KEY_REUSED");
    expect(handler).not.toHaveBeenCalled();
  });

  it("requires the Idempotency-Key header", async () => {
    const withIdempotency = await loadWithIdempotency();
    const handler = vi.fn();
    const wrapped = withIdempotency(handler, { endpoint: ENDPOINT });
    const request = new Request("https://app.test/api/invoices/inv-1/payments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ amount: 100 }),
    });

    const response = await wrapped(USER, request, buildContext());
    const payload = (await response.json()) as { error: { code: string } };

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe("IDEMPOTENCY_KEY_REQUIRED");
    expect(handler).not.toHaveBeenCalled();
  });

  it("rejects an Idempotency-Key shorter than the minimum length", async () => {
    const withIdempotency = await loadWithIdempotency();
    const handler = vi.fn();
    const wrapped = withIdempotency(handler, { endpoint: ENDPOINT });
    const request = new Request("https://app.test/api/invoices/inv-1/payments", {
      method: "POST",
      headers: { "Idempotency-Key": "short", "content-type": "application/json" },
      body: JSON.stringify({ amount: 100 }),
    });

    const response = await wrapped(USER, request, buildContext());
    const payload = (await response.json()) as { error: { code: string } };

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe("IDEMPOTENCY_KEY_INVALID");
    expect(handler).not.toHaveBeenCalled();
  });

  it("deletes an expired claim row before re-claiming the key", async () => {
    const withIdempotency = await loadWithIdempotency();

    idempotencyKey.findUnique.mockResolvedValue({
      id: "stale-claim",
      requestHash: "old-hash",
      responseStatus: 201,
      responseBody: { ok: true },
      expiresAt: new Date(Date.now() - 60_000),
    });
    idempotencyKey.deleteMany.mockResolvedValue({ count: 1 });
    idempotencyKey.create.mockResolvedValue({ id: "fresh-claim" });
    idempotencyKey.update.mockResolvedValue({ id: "fresh-claim" });

    const handler = successHandler();
    const wrapped = withIdempotency(handler, { endpoint: ENDPOINT });

    const response = await wrapped(USER, buildRequest(), buildContext());

    expect(idempotencyKey.deleteMany).toHaveBeenCalledTimes(1);
    expect(idempotencyKey.create).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(201);
  });
});
