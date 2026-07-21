import { nanoid } from "nanoid";

import { NANOID } from "@app/shared/config/config";
import { INVOICE_EVENT, INVOICE_STATUS } from "@app/shared/config/invoice-status";
import { calculateTotals, isMoneyLimitExceeded } from "@app/shared/lib/calculations";
import { CreateInvoiceInput } from "@app/shared/schemas";
import { SCHEMA_LIMITS } from "@app/shared/schemas/limits";
import type { UserId } from "@app/shared/types/ids";

import { prisma } from "@app/server/db";

import {
  assertClientOwned,
  INVOICE_WITH_RELATIONS_INCLUDE,
  type InvoiceWithRelations,
  MoneyOverflowError,
} from "./invoice-fields";
import { createItemGroups, ITEM_GROUPS_INCLUDE } from "./item-groups";

export async function createInvoice(
  userId: UserId,
  data: CreateInvoiceInput
): Promise<InvoiceWithRelations> {
  const allItems = [...data.items, ...(data.itemGroups?.flatMap((g) => g.items) ?? [])];
  const totals = calculateTotals(allItems, data.discount, data.taxRate);

  if (isMoneyLimitExceeded(totals, SCHEMA_LIMITS.MONEY_MAX_CENTS)) {
    throw new MoneyOverflowError();
  }

  const { subtotal, discountAmount, taxAmount, total } = totals;
  const publicId = nanoid(NANOID.PUBLIC_ID_LENGTH);

  return prisma.$transaction(async (tx) => {
    await assertClientOwned(tx, data.clientId, userId);

    const invoice = await tx.invoice.create({
      data: {
        userId,
        clientId: data.clientId,
        publicId,
        currency: data.currency,
        dueDate: data.dueDate,
        periodStart: data.periodStart ?? null,
        periodEnd: data.periodEnd ?? null,
        notes: data.notes,
        message: data.message,
        tags: data.tags || [],
        subtotal,
        discountType: data.discount?.type || null,
        discountValue: data.discount?.value || 0,
        discountAmount,
        taxRate: data.taxRate || 0,
        taxAmount,
        total,
        status: INVOICE_STATUS.DRAFT,
        items: {
          create: data.items.map((item, index) => ({
            title: item.title,
            description: item.description ?? null,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: Math.round(item.quantity * item.unitPrice),
            sortOrder: index,
            serviceId: item.serviceId ?? null,
          })),
        },
      },
      include: {
        client: true,
        items: true,
        itemGroups: ITEM_GROUPS_INCLUDE,
      },
    });

    if (data.itemGroups?.length) {
      await createItemGroups(tx, invoice.id, data.itemGroups);
    }

    await tx.invoiceEvent.create({
      data: {
        invoiceId: invoice.id,
        type: INVOICE_EVENT.CREATED,
        payload: {},
      },
    });

    return tx.invoice.findUniqueOrThrow({
      where: { id: invoice.id },
      include: INVOICE_WITH_RELATIONS_INCLUDE,
    });
  });
}
