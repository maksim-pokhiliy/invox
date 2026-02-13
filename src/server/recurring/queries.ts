import { prisma } from "@app/server/db";

const RECURRING_INCLUDE = {
  client: { select: { id: true, name: true, email: true } },
  items: { orderBy: { sortOrder: "asc" as const } },
  itemGroups: {
    include: { items: { orderBy: { sortOrder: "asc" as const } } },
    orderBy: { sortOrder: "asc" as const },
  },
};

export async function getRecurringInvoices(userId: string) {
  return prisma.recurringInvoice.findMany({
    where: { userId },
    include: RECURRING_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
}

export async function getRecurringInvoice(userId: string, id: string) {
  return prisma.recurringInvoice.findFirst({
    where: { id, userId },
    include: RECURRING_INCLUDE,
  });
}
