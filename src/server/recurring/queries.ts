import { prisma } from "@app/server/db";

const RECURRING_CLIENT_SELECT = { id: true, name: true, email: true } as const;

export async function getRecurringInvoices(userId: string) {
  return prisma.recurringInvoice.findMany({
    where: { userId },
    include: {
      client: { select: RECURRING_CLIENT_SELECT },
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getRecurringInvoice(userId: string, id: string) {
  return prisma.recurringInvoice.findFirst({
    where: { id, userId },
    include: {
      client: { select: RECURRING_CLIENT_SELECT },
      items: true,
    },
  });
}
