import { nanoid } from "nanoid";

import { INVOICE, NANOID, TIME } from "@app/shared/config/config";
import { INVOICE_STATUS } from "@app/shared/config/invoice-status";

import { prisma } from "@app/server/db";

import { createItemGroups, ITEM_GROUPS_INCLUDE } from "./item-groups";

export async function duplicateInvoice(id: string, userId: string) {
  const invoice = await prisma.invoice.findFirst({
    where: { id, userId },
    include: {
      items: true,
      itemGroups: { include: { items: true }, orderBy: { sortOrder: "asc" } },
    },
  });

  if (!invoice) {
    return null;
  }

  const publicId = nanoid(NANOID.PUBLIC_ID_LENGTH);
  const ungroupedItems = invoice.items.filter((item) => !item.groupId);

  const newInvoice = await prisma.invoice.create({
    data: {
      userId,
      clientId: invoice.clientId,
      publicId,
      currency: invoice.currency,
      status: INVOICE_STATUS.DRAFT,
      dueDate: new Date(Date.now() + INVOICE.DEFAULT_DUE_DAYS * TIME.DAY),
      subtotal: invoice.subtotal,
      total: invoice.total,
      tags: invoice.tags as string[],
      items: {
        create: ungroupedItems.map((item) => ({
          title: item.title,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.amount,
          sortOrder: item.sortOrder,
        })),
      },
    },
    include: {
      client: true,
      items: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (invoice.itemGroups.length > 0) {
    await createItemGroups(
      newInvoice.id,
      invoice.itemGroups.map((g) => ({
        title: g.title,
        sortOrder: g.sortOrder,
        items: g.items.map((item) => ({
          title: item.title,
          description: item.description ?? undefined,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          sortOrder: item.sortOrder,
        })),
      }))
    );
  }

  return prisma.invoice.findUniqueOrThrow({
    where: { id: newInvoice.id },
    include: {
      client: true,
      items: { where: { groupId: null }, orderBy: { sortOrder: "asc" } },
      itemGroups: ITEM_GROUPS_INCLUDE,
    },
  });
}
