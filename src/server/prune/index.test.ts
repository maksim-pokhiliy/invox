import type { PrismaClient } from "@prisma/client";
import { randomBytes } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const pruneExpiredIdempotencyKeys = vi.fn();
const countExpiredIdempotencyKeys = vi.fn();
const pruneOutboxSent = vi.fn();
const pruneOutboxFailed = vi.fn();
const countOutboxSent = vi.fn();
const countOutboxFailed = vi.fn();
const pruneConvertedWaitlistEntries = vi.fn();
const countConvertedWaitlistEntries = vi.fn();

vi.mock("@app/server/api/idempotency", () => ({
  pruneExpiredIdempotencyKeys,
  countExpiredIdempotencyKeys,
}));

vi.mock("@app/server/email/outbox-prune", () => ({
  pruneOutboxSent,
  pruneOutboxFailed,
  countOutboxSent,
  countOutboxFailed,
}));

vi.mock("@app/server/waitlist", () => ({
  pruneConvertedWaitlistEntries,
  countConvertedWaitlistEntries,
}));

const FIXED_NOW = new Date("2026-05-23T00:00:00Z");

const fakeClient = {} as PrismaClient;

async function loadOrchestrator() {
  vi.resetModules();
  vi.stubEnv("DATABASE_URL", "postgresql://localhost:5432/test");
  vi.stubEnv("NEXTAUTH_SECRET", randomBytes(32).toString("base64"));

  return import("./index");
}

beforeEach(() => {
  pruneExpiredIdempotencyKeys.mockReset();
  countExpiredIdempotencyKeys.mockReset();
  pruneOutboxSent.mockReset();
  pruneOutboxFailed.mockReset();
  countOutboxSent.mockReset();
  countOutboxFailed.mockReset();
  pruneConvertedWaitlistEntries.mockReset();
  countConvertedWaitlistEntries.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("pruneExpired — live mode", () => {
  it("aggregates real counts from all sub-prunes", async () => {
    const { pruneExpired } = await loadOrchestrator();

    pruneExpiredIdempotencyKeys.mockResolvedValue({ deleted: 11 });
    pruneOutboxSent.mockResolvedValue({ deleted: 22 });
    pruneOutboxFailed.mockResolvedValue({ deleted: 3 });
    pruneConvertedWaitlistEntries.mockResolvedValue({ deleted: 5 });

    const report = await pruneExpired(fakeClient, { now: FIXED_NOW });

    expect(report.mode).toBe("live");
    expect(report.now).toBe(FIXED_NOW.toISOString());
    expect(report.hasError).toBe(false);

    if (report.idempotencyKeys.ok) {
      expect(report.idempotencyKeys.deleted).toBe(11);
    } else {
      throw new Error("expected idempotencyKeys.ok === true");
    }

    if (report.emailOutboxSent.ok) {
      expect(report.emailOutboxSent.deleted).toBe(22);
    } else {
      throw new Error("expected emailOutboxSent.ok === true");
    }

    if (report.emailOutboxFailed.ok) {
      expect(report.emailOutboxFailed.deleted).toBe(3);
    } else {
      throw new Error("expected emailOutboxFailed.ok === true");
    }

    if (report.waitlistEntries.ok) {
      expect(report.waitlistEntries.deleted).toBe(5);
    } else {
      throw new Error("expected waitlistEntries.ok === true");
    }
  });
});

describe("pruneExpired — dry-run mode", () => {
  it("dispatches to count* twins and skips prune* functions", async () => {
    const { pruneExpired } = await loadOrchestrator();

    countExpiredIdempotencyKeys.mockResolvedValue({ count: 7 });
    countOutboxSent.mockResolvedValue({ count: 9 });
    countOutboxFailed.mockResolvedValue({ count: 1 });
    countConvertedWaitlistEntries.mockResolvedValue({ candidates: 4 });

    const report = await pruneExpired(fakeClient, { dryRun: true, now: FIXED_NOW });

    expect(report.mode).toBe("dry-run");
    expect(countExpiredIdempotencyKeys).toHaveBeenCalledTimes(1);
    expect(countOutboxSent).toHaveBeenCalledTimes(1);
    expect(countOutboxFailed).toHaveBeenCalledTimes(1);
    expect(countConvertedWaitlistEntries).toHaveBeenCalledTimes(1);
    expect(pruneExpiredIdempotencyKeys).not.toHaveBeenCalled();
    expect(pruneOutboxSent).not.toHaveBeenCalled();
    expect(pruneOutboxFailed).not.toHaveBeenCalled();
    expect(pruneConvertedWaitlistEntries).not.toHaveBeenCalled();
  });
});

describe("pruneExpired — per-arm failure isolation", () => {
  it("a throw from outbox-FAILED arm does not poison the outbox-SENT arm", async () => {
    const { pruneExpired } = await loadOrchestrator();

    pruneExpiredIdempotencyKeys.mockResolvedValue({ deleted: 3 });
    pruneOutboxSent.mockResolvedValue({ deleted: 17 });
    pruneOutboxFailed.mockRejectedValue(new Error("boom"));
    pruneConvertedWaitlistEntries.mockResolvedValue({ deleted: 2 });

    const report = await pruneExpired(fakeClient, { now: FIXED_NOW });

    expect(report.hasError).toBe(true);
    expect(report.idempotencyKeys.ok).toBe(true);
    expect(report.emailOutboxSent.ok).toBe(true);
    expect(report.emailOutboxFailed.ok).toBe(false);
    expect(report.waitlistEntries.ok).toBe(true);

    if (report.emailOutboxSent.ok) {
      expect(report.emailOutboxSent.deleted).toBe(17);
    } else {
      throw new Error("expected emailOutboxSent.ok === true");
    }

    if (!report.emailOutboxFailed.ok) {
      expect(report.emailOutboxFailed.error).toBe("boom");
    } else {
      throw new Error("expected emailOutboxFailed.ok === false");
    }

    expect(pruneConvertedWaitlistEntries).toHaveBeenCalledTimes(1);
  });
});

describe("pruneExpired — sequential execution", () => {
  it("runs sub-prunes in order: idempotency -> outboxSent -> outboxFailed -> waitlist", async () => {
    const { pruneExpired } = await loadOrchestrator();

    const callOrder: string[] = [];

    pruneExpiredIdempotencyKeys.mockImplementation(async () => {
      callOrder.push("idempotency");

      return { deleted: 0 };
    });
    pruneOutboxSent.mockImplementation(async () => {
      callOrder.push("outboxSent");

      return { deleted: 0 };
    });
    pruneOutboxFailed.mockImplementation(async () => {
      callOrder.push("outboxFailed");

      return { deleted: 0 };
    });
    pruneConvertedWaitlistEntries.mockImplementation(async () => {
      callOrder.push("waitlist");

      return { deleted: 0 };
    });

    await pruneExpired(fakeClient, { now: FIXED_NOW });

    expect(callOrder).toEqual(["idempotency", "outboxSent", "outboxFailed", "waitlist"]);
  });
});

describe("pruneExpired — now option", () => {
  it("uses the provided now option for all sub-prunes", async () => {
    const { pruneExpired } = await loadOrchestrator();

    pruneExpiredIdempotencyKeys.mockResolvedValue({ deleted: 0 });
    pruneOutboxSent.mockResolvedValue({ deleted: 0 });
    pruneOutboxFailed.mockResolvedValue({ deleted: 0 });
    pruneConvertedWaitlistEntries.mockResolvedValue({ deleted: 0 });

    const customNow = new Date("2026-01-01T00:00:00Z");

    await pruneExpired(fakeClient, { now: customNow });

    expect(pruneExpiredIdempotencyKeys).toHaveBeenCalledWith(fakeClient, customNow);
    expect(pruneOutboxSent).toHaveBeenCalledWith(fakeClient, customNow);
    expect(pruneOutboxFailed).toHaveBeenCalledWith(fakeClient, customNow);
    expect(pruneConvertedWaitlistEntries).toHaveBeenCalledWith(fakeClient, customNow);
  });
});

describe("pruneExpired — DB-clock now", () => {
  it("queries $queryRaw for SELECT NOW() when now option is omitted", async () => {
    const { pruneExpired } = await loadOrchestrator();

    const dbNow = new Date("2026-07-04T12:00:00Z");
    const queryRaw = vi.fn().mockResolvedValue([{ now: dbNow }]);
    const client = { $queryRaw: queryRaw } as unknown as PrismaClient;

    pruneExpiredIdempotencyKeys.mockResolvedValue({ deleted: 0 });
    pruneOutboxSent.mockResolvedValue({ deleted: 0 });
    pruneOutboxFailed.mockResolvedValue({ deleted: 0 });
    pruneConvertedWaitlistEntries.mockResolvedValue({ deleted: 0 });

    const report = await pruneExpired(client);

    expect(queryRaw).toHaveBeenCalledTimes(1);
    expect(report.now).toBe(dbNow.toISOString());
    expect(pruneExpiredIdempotencyKeys).toHaveBeenCalledWith(client, dbNow);
    expect(pruneOutboxSent).toHaveBeenCalledWith(client, dbNow);
    expect(pruneOutboxFailed).toHaveBeenCalledWith(client, dbNow);
    expect(pruneConvertedWaitlistEntries).toHaveBeenCalledWith(client, dbNow);
  });

  it("does not call $queryRaw when an explicit now is provided", async () => {
    const { pruneExpired } = await loadOrchestrator();

    const queryRaw = vi.fn();
    const client = { $queryRaw: queryRaw } as unknown as PrismaClient;

    pruneExpiredIdempotencyKeys.mockResolvedValue({ deleted: 0 });
    pruneOutboxSent.mockResolvedValue({ deleted: 0 });
    pruneOutboxFailed.mockResolvedValue({ deleted: 0 });
    pruneConvertedWaitlistEntries.mockResolvedValue({ deleted: 0 });

    await pruneExpired(client, { now: FIXED_NOW });

    expect(queryRaw).not.toHaveBeenCalled();
  });
});
