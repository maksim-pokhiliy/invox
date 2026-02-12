import { InvoiceItemGroupInput } from "@app/shared/schemas";

import { prisma } from "@app/server/db";

export async function createItemGroups(invoiceId: string, groups: InvoiceItemGroupInput[]) {
  for (let gi = 0; gi < groups.length; gi++) {
    const group = groups[gi];
    const created = await prisma.invoiceItemGroup.create({
      data: {
        invoiceId,
        title: group.title,
        sortOrder: gi,
      },
    });

    if (group.items.length > 0) {
      await prisma.invoiceItem.createMany({
        data: group.items.map((item, ii) => ({
          invoiceId,
          groupId: created.id,
          title: item.title,
          description: item.description ?? null,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: Math.round(Math.round(item.quantity * item.unitPrice)),
          sortOrder: ii,
        })),
      });
    }
  }
}

export const ITEM_GROUPS_INCLUDE = {
  include: { items: { orderBy: { sortOrder: "asc" as const } } },
  orderBy: { sortOrder: "asc" as const },
};
