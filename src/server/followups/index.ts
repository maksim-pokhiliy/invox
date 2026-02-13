import { FollowUpMode } from "@prisma/client";

import { REMINDER, REMINDER_MODE } from "@app/shared/config/config";
import { FOLLOWUP_STATUS } from "@app/shared/config/invoice-status";

import { prisma } from "@app/server/db";

export function parseDelaysDays(value: unknown): number[] {
  if (Array.isArray(value) && value.every((v): v is number => typeof v === "number")) {
    return value;
  }

  return [...REMINDER.DEFAULT_DAYS];
}

export async function getFollowUpRule(userId: string) {
  return prisma.followUpRule.findFirst({
    where: { userId },
  });
}

export async function createOrUpdateFollowUpRule(
  userId: string,
  data: {
    enabled: boolean;
    mode: FollowUpMode;
    delaysDays: number[];
  }
) {
  const existing = await prisma.followUpRule.findFirst({
    where: { userId },
  });

  if (existing) {
    return prisma.followUpRule.update({
      where: { id: existing.id },
      data: {
        enabled: data.enabled,
        mode: data.mode,
        delaysDays: data.delaysDays,
      },
    });
  }

  return prisma.followUpRule.create({
    data: {
      userId,
      enabled: data.enabled,
      mode: data.mode,
      delaysDays: data.delaysDays,
    },
  });
}

export async function scheduleFollowUps(
  invoiceId: string,
  sentAt: Date,
  dueDate: Date,
  rule: {
    mode: FollowUpMode;
    delaysDays: number[];
  }
) {
  const baseDate = rule.mode === REMINDER_MODE.AFTER_SENT ? sentAt : dueDate;
  const delays = rule.delaysDays;

  const jobs = delays.map((days) => {
    const scheduledFor = new Date(baseDate);

    scheduledFor.setDate(scheduledFor.getDate() + days);

    return {
      invoiceId,
      scheduledFor,
      status: FOLLOWUP_STATUS.PENDING,
    };
  });

  await prisma.followUpJob.createMany({
    data: jobs,
  });

  return jobs;
}

export async function getPendingFollowUpJobs() {
  return prisma.followUpJob.findMany({
    where: {
      status: FOLLOWUP_STATUS.PENDING,
      scheduledFor: {
        lte: new Date(),
      },
    },
    include: {
      invoice: {
        include: {
          client: true,
          items: { where: { groupId: null }, orderBy: { sortOrder: "asc" } },
          itemGroups: {
            include: { items: { orderBy: { sortOrder: "asc" } } },
            orderBy: { sortOrder: "asc" },
          },
          user: {
            include: {
              senderProfile: true,
            },
          },
        },
      },
    },
  });
}

export async function markFollowUpJobSent(jobId: string) {
  return prisma.followUpJob.update({
    where: { id: jobId },
    data: {
      status: FOLLOWUP_STATUS.SENT,
      sentAt: new Date(),
    },
  });
}

export async function cancelPendingFollowUps(invoiceId: string) {
  return prisma.followUpJob.updateMany({
    where: {
      invoiceId,
      status: FOLLOWUP_STATUS.PENDING,
    },
    data: {
      status: FOLLOWUP_STATUS.CANCELED,
    },
  });
}
