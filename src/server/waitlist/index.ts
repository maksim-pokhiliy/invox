import type { PrismaClient, WaitlistEntry } from "@prisma/client";

import { EMAIL_OUTBOX_KIND, EMAIL_OUTBOX_RELATED_TYPE } from "@app/shared/config/email-outbox";
import { WAITLIST } from "@app/shared/config/waitlist";
import type { WaitlistCheckStatus } from "@app/shared/schemas";
import { WAITLIST_STATUS } from "@app/shared/schemas";

import { prisma } from "@app/server/db";
import {
  buildWaitlistApprovalPayload,
  buildWaitlistConfirmationPayload,
  buildWaitlistNotificationPayload,
} from "@app/server/email";
import { createStableOutbox } from "@app/server/email/outbox";
import { pruneArm } from "@app/server/prune/run";

export class WaitlistEntryNotFoundError extends Error {
  constructor() {
    super("Waitlist entry not found");
    this.name = "WaitlistEntryNotFoundError";
  }
}

export interface AddToWaitlistResult {
  created: boolean;
  entryId: string | null;
  confirmationOutboxId: string | null;
  notificationOutboxId: string | null;
}

export async function addToWaitlist(email: string): Promise<AddToWaitlistResult> {
  const existing = await prisma.waitlistEntry.findUnique({ where: { email } });

  if (existing) {
    return {
      created: false,
      entryId: existing.id,
      confirmationOutboxId: null,
      notificationOutboxId: null,
    };
  }

  const confirmationPayload = buildWaitlistConfirmationPayload(email);
  const notificationPayload = buildWaitlistNotificationPayload(email);

  return prisma.$transaction(async (tx) => {
    const entry = await tx.waitlistEntry.create({ data: { email } });

    const confirmationRow = await createStableOutbox(tx, {
      userId: null,
      kind: EMAIL_OUTBOX_KIND.WAITLIST_CONFIRMATION,
      relatedType: EMAIL_OUTBOX_RELATED_TYPE.WAITLIST_ENTRY,
      relatedId: entry.id,
      payload: confirmationPayload,
    });

    let notificationOutboxId: string | null = null;

    if (notificationPayload) {
      const notificationRow = await createStableOutbox(tx, {
        userId: null,
        kind: EMAIL_OUTBOX_KIND.WAITLIST_NOTIFICATION,
        relatedType: EMAIL_OUTBOX_RELATED_TYPE.WAITLIST_ENTRY,
        relatedId: entry.id,
        payload: notificationPayload,
      });

      notificationOutboxId = notificationRow.id;
    }

    return {
      created: true,
      entryId: entry.id,
      confirmationOutboxId: confirmationRow.id,
      notificationOutboxId,
    };
  });
}

export async function checkWaitlistStatus(email: string): Promise<WaitlistCheckStatus> {
  const entry = await prisma.waitlistEntry.findUnique({ where: { email } });

  if (!entry) {
    return WAITLIST_STATUS.NOT_FOUND;
  }

  return entry.status === "APPROVED" ? WAITLIST_STATUS.APPROVED : WAITLIST_STATUS.PENDING;
}

export interface ApproveWaitlistResult {
  entryId: string;
  outboxId: string;
}

export async function approveWaitlistEntry(email: string): Promise<ApproveWaitlistResult> {
  const payload = buildWaitlistApprovalPayload(email);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.waitlistEntry.findUnique({ where: { email } });

    if (!existing) {
      throw new WaitlistEntryNotFoundError();
    }

    const entry = await tx.waitlistEntry.update({
      where: { email },
      data: { status: "APPROVED" },
    });

    const row = await createStableOutbox(tx, {
      userId: null,
      kind: EMAIL_OUTBOX_KIND.WAITLIST_APPROVAL,
      relatedType: EMAIL_OUTBOX_RELATED_TYPE.WAITLIST_ENTRY,
      relatedId: entry.id,
      payload,
    });

    return { entryId: entry.id, outboxId: row.id };
  });
}

export async function isEmailApproved(email: string): Promise<boolean> {
  const entry = await prisma.waitlistEntry.findUnique({ where: { email } });

  return entry?.status === "APPROVED";
}

export async function listWaitlistEntries(): Promise<WaitlistEntry[]> {
  return prisma.waitlistEntry.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteWaitlistEntry(id: string): Promise<WaitlistEntry | null> {
  const entry = await prisma.waitlistEntry.findUnique({ where: { id } });

  if (!entry) {
    return null;
  }

  return prisma.waitlistEntry.delete({ where: { id } });
}

export interface WaitlistRetentionOverrides {
  orphanDays?: number;
}

const WAITLIST_TABLE = "WaitlistEntry";
const WAITLIST_RETENTION_LABEL = "Waitlist orphan retention";

export async function pruneConvertedWaitlistEntries(
  client: PrismaClient,
  now: Date,
  retention: WaitlistRetentionOverrides = {}
): Promise<{ deleted: number }> {
  const days = retention.orphanDays ?? WAITLIST.ORPHAN_RETENTION_DAYS;

  const deleted = await pruneArm({
    client,
    now,
    table: WAITLIST_TABLE,
    retention: { days, label: WAITLIST_RETENTION_LABEL },
    mode: "prune",
    run: ({ client: c, cutoff }) => deleteConvertedOrphans(c, cutoff),
  });

  return { deleted };
}

async function deleteConvertedOrphans(client: PrismaClient, cutoff: Date): Promise<number> {
  const candidates = await client.waitlistEntry.findMany({
    where: { createdAt: { lt: cutoff } },
    select: { email: true },
  });

  if (candidates.length === 0) {
    return 0;
  }

  const candidateEmails = candidates.map((c) => c.email);

  const matchedUsers = await client.user.findMany({
    where: { email: { in: candidateEmails } },
    select: { email: true },
  });

  if (matchedUsers.length === 0) {
    return 0;
  }

  const orphanEmails = matchedUsers.map((u) => u.email);

  const result = await client.waitlistEntry.deleteMany({
    where: { email: { in: orphanEmails }, createdAt: { lt: cutoff } },
  });

  return result.count;
}

export async function countConvertedWaitlistEntries(
  client: PrismaClient,
  now: Date,
  retention: WaitlistRetentionOverrides = {}
): Promise<{ candidates: number }> {
  const days = retention.orphanDays ?? WAITLIST.ORPHAN_RETENTION_DAYS;

  const candidates = await pruneArm({
    client,
    now,
    table: WAITLIST_TABLE,
    retention: { days, label: WAITLIST_RETENTION_LABEL },
    mode: "count",
    run: ({ client: c, cutoff }) =>
      c.waitlistEntry.count({
        where: { createdAt: { lt: cutoff } },
      }),
  });

  return { candidates };
}
