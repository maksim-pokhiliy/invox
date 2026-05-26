import { randomBytes } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const emailOutbox = {
  deleteMany: vi.fn(),
  count: vi.fn(),
};

vi.mock("@app/server/db", () => ({
  prisma: { emailOutbox },
}));

const FIXED_NOW = new Date("2026-05-23T00:00:00Z");
const RETENTION_SENT_DAYS = 30;
const RETENTION_FAILED_DAYS = 90;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const CUTOFF_SENT = new Date(FIXED_NOW.getTime() - RETENTION_SENT_DAYS * MS_PER_DAY);
const CUTOFF_FAILED = new Date(FIXED_NOW.getTime() - RETENTION_FAILED_DAYS * MS_PER_DAY);
const LARGE_DELETE_COUNT = 50_001;

async function loadModule() {
  vi.resetModules();
  vi.stubEnv("DATABASE_URL", "postgresql://localhost:5432/test");
  vi.stubEnv("NEXTAUTH_SECRET", randomBytes(32).toString("base64"));

  const helpers = await import("./outbox-prune");
  const db = await import("@app/server/db");

  return { ...helpers, prisma: db.prisma };
}

beforeEach(() => {
  emailOutbox.deleteMany.mockReset();
  emailOutbox.count.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("pruneOutboxSent", () => {
  it("returns deleted = 0 when no SENT rows", async () => {
    const { pruneOutboxSent, prisma } = await loadModule();

    emailOutbox.deleteMany.mockResolvedValue({ count: 0 });

    const result = await pruneOutboxSent(prisma, FIXED_NOW);

    expect(result).toEqual({ deleted: 0 });
    expect(emailOutbox.deleteMany).toHaveBeenCalledTimes(1);
  });

  it("deletes SENT rows older than RETENTION_SENT_DAYS (30d)", async () => {
    const { pruneOutboxSent, prisma } = await loadModule();

    emailOutbox.deleteMany.mockResolvedValue({ count: 5 });

    const result = await pruneOutboxSent(prisma, FIXED_NOW);

    expect(result.deleted).toBe(5);
    expect(emailOutbox.deleteMany).toHaveBeenCalledWith({
      where: { status: "SENT", createdAt: { lt: CUTOFF_SENT } },
    });
  });

  it("does not delete PENDING or FAILED rows", async () => {
    const { pruneOutboxSent, prisma } = await loadModule();

    emailOutbox.deleteMany.mockResolvedValue({ count: 0 });

    await pruneOutboxSent(prisma, FIXED_NOW);

    const call = emailOutbox.deleteMany.mock.calls[0]?.[0] as {
      where: { status: string };
    };

    expect(call.where.status).toBe("SENT");
  });

  it("emits large-delete warning when SENT count > 50_000", async () => {
    const { pruneOutboxSent, prisma } = await loadModule();
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    emailOutbox.deleteMany.mockResolvedValue({ count: LARGE_DELETE_COUNT });

    await pruneOutboxSent(prisma, FIXED_NOW);

    expect(warnSpy).toHaveBeenCalledTimes(1);

    const payload = JSON.parse(String(warnSpy.mock.calls[0]?.[0])) as {
      event: string;
      arm: string;
      deleted: number;
    };

    expect(payload.event).toBe("prune.warning.large_delete");
    expect(payload.arm).toBe("SENT");
    expect(payload.deleted).toBe(LARGE_DELETE_COUNT);

    warnSpy.mockRestore();
  });

  it("throws RetentionMisconfiguredError when sentDays override is 0", async () => {
    const { pruneOutboxSent, prisma } = await loadModule();
    const { RetentionMisconfiguredError } = await import("@app/server/prune/errors");

    await expect(pruneOutboxSent(prisma, FIXED_NOW, { sentDays: 0 })).rejects.toBeInstanceOf(
      RetentionMisconfiguredError
    );
    expect(emailOutbox.deleteMany).not.toHaveBeenCalled();
  });
});

describe("pruneOutboxFailed", () => {
  it("returns deleted = 0 when no FAILED rows", async () => {
    const { pruneOutboxFailed, prisma } = await loadModule();

    emailOutbox.deleteMany.mockResolvedValue({ count: 0 });

    const result = await pruneOutboxFailed(prisma, FIXED_NOW);

    expect(result).toEqual({ deleted: 0 });
    expect(emailOutbox.deleteMany).toHaveBeenCalledTimes(1);
  });

  it("deletes FAILED rows older than RETENTION_FAILED_DAYS (90d)", async () => {
    const { pruneOutboxFailed, prisma } = await loadModule();

    emailOutbox.deleteMany.mockResolvedValue({ count: 2 });

    const result = await pruneOutboxFailed(prisma, FIXED_NOW);

    expect(result.deleted).toBe(2);
    expect(emailOutbox.deleteMany).toHaveBeenCalledWith({
      where: { status: "FAILED", createdAt: { lt: CUTOFF_FAILED } },
    });
  });

  it("does not delete PENDING or SENT rows", async () => {
    const { pruneOutboxFailed, prisma } = await loadModule();

    emailOutbox.deleteMany.mockResolvedValue({ count: 0 });

    await pruneOutboxFailed(prisma, FIXED_NOW);

    const call = emailOutbox.deleteMany.mock.calls[0]?.[0] as {
      where: { status: string };
    };

    expect(call.where.status).toBe("FAILED");
  });

  it("emits large-delete warning when FAILED count > 50_000", async () => {
    const { pruneOutboxFailed, prisma } = await loadModule();
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    emailOutbox.deleteMany.mockResolvedValue({ count: LARGE_DELETE_COUNT + 1 });

    await pruneOutboxFailed(prisma, FIXED_NOW);

    expect(warnSpy).toHaveBeenCalledTimes(1);

    const payload = JSON.parse(String(warnSpy.mock.calls[0]?.[0])) as {
      event: string;
      arm: string;
      deleted: number;
    };

    expect(payload.event).toBe("prune.warning.large_delete");
    expect(payload.arm).toBe("FAILED");
    expect(payload.deleted).toBe(LARGE_DELETE_COUNT + 1);

    warnSpy.mockRestore();
  });

  it("throws RetentionMisconfiguredError when failedDays override is 0", async () => {
    const { pruneOutboxFailed, prisma } = await loadModule();
    const { RetentionMisconfiguredError } = await import("@app/server/prune/errors");

    await expect(pruneOutboxFailed(prisma, FIXED_NOW, { failedDays: 0 })).rejects.toBeInstanceOf(
      RetentionMisconfiguredError
    );
    expect(emailOutbox.deleteMany).not.toHaveBeenCalled();
  });
});

describe("countOutboxSent", () => {
  it("returns count = 0 when no rows", async () => {
    const { countOutboxSent, prisma } = await loadModule();

    emailOutbox.count.mockResolvedValue(0);

    const result = await countOutboxSent(prisma, FIXED_NOW);

    expect(result).toEqual({ count: 0 });
    expect(emailOutbox.count).toHaveBeenCalledTimes(1);
  });

  it("counts SENT rows with same cutoff as the prune", async () => {
    const { countOutboxSent, prisma } = await loadModule();

    emailOutbox.count.mockResolvedValue(11);

    const result = await countOutboxSent(prisma, FIXED_NOW);

    expect(result).toEqual({ count: 11 });
    expect(emailOutbox.count).toHaveBeenCalledWith({
      where: { status: "SENT", createdAt: { lt: CUTOFF_SENT } },
    });
  });

  it("uses identical WHERE predicate as pruneOutboxSent", async () => {
    const { pruneOutboxSent, countOutboxSent, prisma } = await loadModule();

    emailOutbox.deleteMany.mockResolvedValue({ count: 0 });
    emailOutbox.count.mockResolvedValue(0);

    await pruneOutboxSent(prisma, FIXED_NOW);
    await countOutboxSent(prisma, FIXED_NOW);

    const pruneCall = emailOutbox.deleteMany.mock.calls[0]?.[0];
    const countCall = emailOutbox.count.mock.calls[0]?.[0];

    expect(countCall).toEqual(pruneCall);
  });

  it("throws RetentionMisconfiguredError when sentDays override is 0", async () => {
    const { countOutboxSent, prisma } = await loadModule();
    const { RetentionMisconfiguredError } = await import("@app/server/prune/errors");

    await expect(countOutboxSent(prisma, FIXED_NOW, { sentDays: 0 })).rejects.toBeInstanceOf(
      RetentionMisconfiguredError
    );
    expect(emailOutbox.count).not.toHaveBeenCalled();
  });

  it("emits large-backlog warning with wouldDelete when SENT count > 50_000", async () => {
    const { countOutboxSent, prisma } = await loadModule();
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    emailOutbox.count.mockResolvedValue(LARGE_DELETE_COUNT);

    await countOutboxSent(prisma, FIXED_NOW);

    expect(warnSpy).toHaveBeenCalledTimes(1);

    const payload = JSON.parse(String(warnSpy.mock.calls[0]?.[0])) as {
      event: string;
      arm: string;
      wouldDelete: number;
    };

    expect(payload.event).toBe("prune.warning.large_backlog");
    expect(payload.arm).toBe("SENT");
    expect(payload.wouldDelete).toBe(LARGE_DELETE_COUNT);

    warnSpy.mockRestore();
  });
});

describe("countOutboxFailed", () => {
  it("returns count = 0 when no rows", async () => {
    const { countOutboxFailed, prisma } = await loadModule();

    emailOutbox.count.mockResolvedValue(0);

    const result = await countOutboxFailed(prisma, FIXED_NOW);

    expect(result).toEqual({ count: 0 });
    expect(emailOutbox.count).toHaveBeenCalledTimes(1);
  });

  it("counts FAILED rows with same cutoff as the prune", async () => {
    const { countOutboxFailed, prisma } = await loadModule();

    emailOutbox.count.mockResolvedValue(3);

    const result = await countOutboxFailed(prisma, FIXED_NOW);

    expect(result).toEqual({ count: 3 });
    expect(emailOutbox.count).toHaveBeenCalledWith({
      where: { status: "FAILED", createdAt: { lt: CUTOFF_FAILED } },
    });
  });

  it("uses identical WHERE predicate as pruneOutboxFailed", async () => {
    const { pruneOutboxFailed, countOutboxFailed, prisma } = await loadModule();

    emailOutbox.deleteMany.mockResolvedValue({ count: 0 });
    emailOutbox.count.mockResolvedValue(0);

    await pruneOutboxFailed(prisma, FIXED_NOW);
    await countOutboxFailed(prisma, FIXED_NOW);

    const pruneCall = emailOutbox.deleteMany.mock.calls[0]?.[0];
    const countCall = emailOutbox.count.mock.calls[0]?.[0];

    expect(countCall).toEqual(pruneCall);
  });

  it("throws RetentionMisconfiguredError when failedDays override is 0", async () => {
    const { countOutboxFailed, prisma } = await loadModule();
    const { RetentionMisconfiguredError } = await import("@app/server/prune/errors");

    await expect(countOutboxFailed(prisma, FIXED_NOW, { failedDays: 0 })).rejects.toBeInstanceOf(
      RetentionMisconfiguredError
    );
    expect(emailOutbox.count).not.toHaveBeenCalled();
  });

  it("emits large-backlog warning with wouldDelete when FAILED count > 50_000", async () => {
    const { countOutboxFailed, prisma } = await loadModule();
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    emailOutbox.count.mockResolvedValue(LARGE_DELETE_COUNT + 1);

    await countOutboxFailed(prisma, FIXED_NOW);

    expect(warnSpy).toHaveBeenCalledTimes(1);

    const payload = JSON.parse(String(warnSpy.mock.calls[0]?.[0])) as {
      event: string;
      arm: string;
      wouldDelete: number;
    };

    expect(payload.event).toBe("prune.warning.large_backlog");
    expect(payload.arm).toBe("FAILED");
    expect(payload.wouldDelete).toBe(LARGE_DELETE_COUNT + 1);

    warnSpy.mockRestore();
  });
});
