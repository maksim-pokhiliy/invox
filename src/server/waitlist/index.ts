import type { WaitlistCheckStatus } from "@app/shared/schemas";
import { WAITLIST_STATUS } from "@app/shared/schemas";

import { prisma } from "@app/server/db";

export async function addToWaitlist(email: string): Promise<{ created: boolean }> {
  const existing = await prisma.waitlistEntry.findUnique({ where: { email } });

  if (existing) {
    return { created: false };
  }

  await prisma.waitlistEntry.create({ data: { email } });

  return { created: true };
}

export async function checkWaitlistStatus(email: string): Promise<WaitlistCheckStatus> {
  const entry = await prisma.waitlistEntry.findUnique({ where: { email } });

  if (!entry) {
    return WAITLIST_STATUS.NOT_FOUND;
  }

  return entry.status === "APPROVED" ? WAITLIST_STATUS.APPROVED : WAITLIST_STATUS.PENDING;
}

export async function approveWaitlistEntry(email: string) {
  return prisma.waitlistEntry.update({
    where: { email },
    data: { status: "APPROVED" },
  });
}

export async function isEmailApproved(email: string): Promise<boolean> {
  const entry = await prisma.waitlistEntry.findUnique({ where: { email } });

  return entry?.status === "APPROVED";
}
