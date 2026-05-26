import type { PrismaClient } from "@prisma/client";

import {
  countExpiredIdempotencyKeys,
  pruneExpiredIdempotencyKeys,
} from "@app/server/api/idempotency";
import {
  countOutboxFailed,
  countOutboxSent,
  pruneOutboxFailed,
  pruneOutboxSent,
} from "@app/server/email/outbox";
import { countConvertedWaitlistEntries, pruneConvertedWaitlistEntries } from "@app/server/waitlist";

export { RetentionMisconfiguredError } from "./errors";

export type PruneTableResult =
  | { ok: true; deleted: number; durationMs: number }
  | { ok: false; error: string; durationMs: number };

export interface PruneReport {
  mode: "live" | "dry-run";
  now: string;
  idempotencyKeys: PruneTableResult;
  emailOutboxSent: PruneTableResult;
  emailOutboxFailed: PruneTableResult;
  waitlistEntries: PruneTableResult;
  hasError: boolean;
}

export interface PruneOptions {
  dryRun?: boolean;
  now?: Date;
}

type ReportKey = "idempotencyKeys" | "emailOutboxSent" | "emailOutboxFailed" | "waitlistEntries";

interface RetentionTable {
  key: ReportKey;
  runLive: (client: PrismaClient, now: Date) => Promise<number>;
  runDryRun: (client: PrismaClient, now: Date) => Promise<number>;
}

const RETENTION_TABLES: readonly RetentionTable[] = [
  {
    key: "idempotencyKeys",
    runLive: async (client, now) => (await pruneExpiredIdempotencyKeys(client, now)).deleted,
    runDryRun: async (client, now) => (await countExpiredIdempotencyKeys(client, now)).count,
  },
  {
    key: "emailOutboxSent",
    runLive: async (client, now) => (await pruneOutboxSent(client, now)).deleted,
    runDryRun: async (client, now) => (await countOutboxSent(client, now)).count,
  },
  {
    key: "emailOutboxFailed",
    runLive: async (client, now) => (await pruneOutboxFailed(client, now)).deleted,
    runDryRun: async (client, now) => (await countOutboxFailed(client, now)).count,
  },
  {
    key: "waitlistEntries",
    runLive: async (client, now) => (await pruneConvertedWaitlistEntries(client, now)).deleted,
    runDryRun: async (client, now) => (await countConvertedWaitlistEntries(client, now)).candidates,
  },
];

function elapsedMs(start: number): number {
  return Math.round(performance.now() - start);
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function runTable(
  table: RetentionTable,
  client: PrismaClient,
  now: Date,
  isDryRun: boolean
): Promise<PruneTableResult> {
  const start = performance.now();

  try {
    const deleted = isDryRun
      ? await table.runDryRun(client, now)
      : await table.runLive(client, now);

    return { ok: true, deleted, durationMs: elapsedMs(start) };
  } catch (error) {
    return { ok: false, error: toErrorMessage(error), durationMs: elapsedMs(start) };
  }
}

async function resolveNow(client: PrismaClient, override?: Date): Promise<Date> {
  if (override) {
    return override;
  }

  const rows = await client.$queryRaw<{ now: Date }[]>`SELECT NOW() as now`;

  return rows[0]?.now ?? new Date();
}

export async function pruneExpired(
  client: PrismaClient,
  options?: PruneOptions
): Promise<PruneReport> {
  const now = await resolveNow(client, options?.now);
  const isDryRun = options?.dryRun === true;

  const results: Record<ReportKey, PruneTableResult> = {
    idempotencyKeys: { ok: true, deleted: 0, durationMs: 0 },
    emailOutboxSent: { ok: true, deleted: 0, durationMs: 0 },
    emailOutboxFailed: { ok: true, deleted: 0, durationMs: 0 },
    waitlistEntries: { ok: true, deleted: 0, durationMs: 0 },
  };

  for (const table of RETENTION_TABLES) {
    results[table.key] = await runTable(table, client, now, isDryRun);
  }

  const hasError =
    !results.idempotencyKeys.ok ||
    !results.emailOutboxSent.ok ||
    !results.emailOutboxFailed.ok ||
    !results.waitlistEntries.ok;

  return {
    mode: isDryRun ? "dry-run" : "live",
    now: now.toISOString(),
    idempotencyKeys: results.idempotencyKeys,
    emailOutboxSent: results.emailOutboxSent,
    emailOutboxFailed: results.emailOutboxFailed,
    waitlistEntries: results.waitlistEntries,
    hasError,
  };
}
