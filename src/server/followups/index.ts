import { prisma } from "@app/server/db";
import { FollowUpMode } from "@prisma/client";
import { FOLLOWUP_STATUS } from "@app/shared/config/invoice-status";

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
  const baseDate = rule.mode === "AFTER_SENT" ? sentAt : dueDate;
  const delays = rule.delaysDays as number[];

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
      status: "SENT",
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
