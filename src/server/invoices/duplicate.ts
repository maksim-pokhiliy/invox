import { nanoid } from "nanoid";

import { INVOICE, NANOID, TIME } from "@app/shared/config/config";
import { INVOICE_STATUS } from "@app/shared/config/invoice-status";
import { buildDiscountInput, calculateTotals } from "@app/shared/lib/calculations";
import { parseInvoiceTags } from "@app/shared/schemas/invoice";
import type { InvoiceId, UserId } from "@app/shared/types/ids";

import { prisma } from "@app/server/db";
import type { InvoiceWithRelations } from "@app/server/invoices";

import { INVOICE_WITH_RELATIONS_INCLUDE } from "./invoice-fields";
import { createItemGroups } from "./item-groups";

export async function duplicateInvoice(
  id: InvoiceId,
  userId: UserId
): Promise<InvoiceWithRelations | null> {
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
  const groupedItems = invoice.itemGroups.flatMap((g) => g.items);
  const discount = buildDiscountInput(invoice.discountType, invoice.discountValue);
  const { subtotal, discountAmount, taxAmount, total } = calculateTotals(
    [...ungroupedItems, ...groupedItems],
    discount,
    invoice.taxRate
  );

  return prisma.$transaction(async (tx) => {
    const newInvoice = await tx.invoice.create({
      data: {
        userId,
        clientId: invoice.clientId,
        publicId,
        currency: invoice.currency,
        status: INVOICE_STATUS.DRAFT,
        dueDate: new Date(Date.now() + INVOICE.DEFAULT_DUE_DAYS * TIME.DAY),
        periodStart: invoice.periodStart,
        periodEnd: invoice.periodEnd,
        subtotal,
        discountType: invoice.discountType,
        discountValue: invoice.discountValue,
        discountAmount,
        taxRate: invoice.taxRate,
        taxAmount,
        total,
        message: invoice.message,
        tags: parseInvoiceTags(invoice.tags),
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
        tx,
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

    return tx.invoice.findUniqueOrThrow({
      where: { id: newInvoice.id },
      include: INVOICE_WITH_RELATIONS_INCLUDE,
    });
  });
}
