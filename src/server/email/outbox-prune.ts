import type { PrismaClient } from "@prisma/client";

import { EMAIL_OUTBOX, EMAIL_OUTBOX_STATUS } from "@app/shared/config/email-outbox";

import { pruneArm } from "@app/server/prune/run";

export interface OutboxSentRetentionOverrides {
  sentDays?: number;
}

export interface OutboxFailedRetentionOverrides {
  failedDays?: number;
}

const OUTBOX_TABLE = "EmailOutbox";
const OUTBOX_SENT_LABEL = "Outbox SENT retention";
const OUTBOX_FAILED_LABEL = "Outbox FAILED retention";

export async function pruneOutboxSent(
  client: PrismaClient,
  now: Date,
  retention: OutboxSentRetentionOverrides = {}
): Promise<{ deleted: number }> {
  const days = retention.sentDays ?? EMAIL_OUTBOX.RETENTION_SENT_DAYS;

  const deleted = await pruneArm({
    client,
    now,
    table: OUTBOX_TABLE,
    arm: EMAIL_OUTBOX_STATUS.SENT,
    retention: { days, label: OUTBOX_SENT_LABEL },
    mode: "prune",
    run: async ({ client: c, cutoff }) => {
      const result = await c.emailOutbox.deleteMany({
        where: { status: EMAIL_OUTBOX_STATUS.SENT, createdAt: { lt: cutoff } },
      });

      return result.count;
    },
  });

  return { deleted };
}

export async function pruneOutboxFailed(
  client: PrismaClient,
  now: Date,
  retention: OutboxFailedRetentionOverrides = {}
): Promise<{ deleted: number }> {
  const days = retention.failedDays ?? EMAIL_OUTBOX.RETENTION_FAILED_DAYS;

  const deleted = await pruneArm({
    client,
    now,
    table: OUTBOX_TABLE,
    arm: EMAIL_OUTBOX_STATUS.FAILED,
    retention: { days, label: OUTBOX_FAILED_LABEL },
    mode: "prune",
    run: async ({ client: c, cutoff }) => {
      const result = await c.emailOutbox.deleteMany({
        where: { status: EMAIL_OUTBOX_STATUS.FAILED, createdAt: { lt: cutoff } },
      });

      return result.count;
    },
  });

  return { deleted };
}

export async function countOutboxSent(
  client: PrismaClient,
  now: Date,
  retention: OutboxSentRetentionOverrides = {}
): Promise<{ count: number }> {
  const days = retention.sentDays ?? EMAIL_OUTBOX.RETENTION_SENT_DAYS;

  const count = await pruneArm({
    client,
    now,
    table: OUTBOX_TABLE,
    arm: EMAIL_OUTBOX_STATUS.SENT,
    retention: { days, label: OUTBOX_SENT_LABEL },
    mode: "count",
    run: ({ client: c, cutoff }) =>
      c.emailOutbox.count({
        where: { status: EMAIL_OUTBOX_STATUS.SENT, createdAt: { lt: cutoff } },
      }),
  });

  return { count };
}

export async function countOutboxFailed(
  client: PrismaClient,
  now: Date,
  retention: OutboxFailedRetentionOverrides = {}
): Promise<{ count: number }> {
  const days = retention.failedDays ?? EMAIL_OUTBOX.RETENTION_FAILED_DAYS;

  const count = await pruneArm({
    client,
    now,
    table: OUTBOX_TABLE,
    arm: EMAIL_OUTBOX_STATUS.FAILED,
    retention: { days, label: OUTBOX_FAILED_LABEL },
    mode: "count",
    run: ({ client: c, cutoff }) =>
      c.emailOutbox.count({
        where: { status: EMAIL_OUTBOX_STATUS.FAILED, createdAt: { lt: cutoff } },
      }),
  });

  return { count };
}
