import { Prisma } from "@prisma/client";

import { INVOICE_STATUS, isDiscountType } from "@app/shared/config/invoice-status";
import {
  calculateTotals,
  type DiscountInput,
  isMoneyLimitExceeded,
} from "@app/shared/lib/calculations";
import { InvoiceItemInput, UpdateInvoiceInput } from "@app/shared/schemas";
import { SCHEMA_LIMITS } from "@app/shared/schemas/limits";
import type { InvoiceId, UserId } from "@app/shared/types/ids";
import { asCents } from "@app/shared/types/money";

import { prisma } from "@app/server/db";

import {
  assertClientOwned,
  INVOICE_WITH_RELATIONS_INCLUDE,
  type InvoiceWithRelations,
  MoneyOverflowError,
} from "./invoice-fields";
import { createItemGroups } from "./item-groups";

function buildBasicUpdateFields(data: UpdateInvoiceInput): Prisma.InvoiceUncheckedUpdateInput {
  const updateData: Prisma.InvoiceUncheckedUpdateInput = {};

  if (data.clientId) {
    updateData.clientId = data.clientId;
  }

  if (data.currency) {
    updateData.currency = data.currency;
  }

  if (data.dueDate) {
    updateData.dueDate = data.dueDate;
  }

  if (data.periodStart !== undefined) {
    updateData.periodStart = data.periodStart ?? null;
  }

  if (data.periodEnd !== undefined) {
    updateData.periodEnd = data.periodEnd ?? null;
  }

  if (data.notes !== undefined) {
    updateData.notes = data.notes;
  }

  if (data.message !== undefined) {
    updateData.message = data.message ?? null;
  }

  if (data.tags !== undefined) {
    updateData.tags = data.tags;
  }

  if (data.taxRate !== undefined) {
    updateData.taxRate = data.taxRate;
  }

  return updateData;
}

function buildDiscountFields(data: UpdateInvoiceInput): Prisma.InvoiceUncheckedUpdateInput {
  if (data.discount === undefined) {
    return {};
  }

  if (data.discount) {
    return {
      discountType: data.discount.type,
      discountValue: data.discount.value,
    };
  }

  return {
    discountType: null,
    discountValue: 0,
    discountAmount: 0,
  };
}

function resolveDiscount(
  data: UpdateInvoiceInput,
  invoice: { discountType: string | null; discountValue: number | null }
): DiscountInput | null {
  if (data.discount !== undefined) {
    return data.discount;
  }

  if (isDiscountType(invoice.discountType) && invoice.discountValue !== null) {
    return {
      type: invoice.discountType,
      value: invoice.discountValue,
    };
  }

  return null;
}

async function getItemsForCalculation(
  tx: Prisma.TransactionClient,
  id: string,
  data: UpdateInvoiceInput
): Promise<InvoiceItemInput[]> {
  const hasItemChanges = data.items || data.itemGroups;

  if (hasItemChanges) {
    await tx.invoiceItem.deleteMany({ where: { invoiceId: id } });
    await tx.invoiceItemGroup.deleteMany({ where: { invoiceId: id } });

    if (data.items) {
      await tx.invoiceItem.createMany({
        data: data.items.map((item, index) => ({
          invoiceId: id,
          title: item.title,
          description: item.description ?? null,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: Math.round(item.quantity * item.unitPrice),
          sortOrder: index,
          serviceId: item.serviceId ?? null,
        })),
      });
    }

    if (data.itemGroups?.length) {
      await createItemGroups(tx, id, data.itemGroups);
    }

    return [...(data.items ?? []), ...(data.itemGroups?.flatMap((g) => g.items) ?? [])];
  }

  const existingItems = await tx.invoiceItem.findMany({ where: { invoiceId: id } });

  return existingItems.map((item) => ({
    title: item.title,
    description: item.description ?? undefined,
    quantity: item.quantity,
    unitPrice: asCents(item.unitPrice),
  }));
}

export async function updateInvoice(
  id: InvoiceId,
  userId: UserId,
  data: UpdateInvoiceInput
): Promise<InvoiceWithRelations | null> {
  return prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.findFirst({
      where: { id, userId, status: INVOICE_STATUS.DRAFT },
    });

    if (!invoice) {
      return null;
    }

    if (data.clientId) {
      await assertClientOwned(tx, data.clientId, userId);
    }

    const updateData: Prisma.InvoiceUncheckedUpdateInput = {
      ...buildBasicUpdateFields(data),
      ...buildDiscountFields(data),
    };

    const needsRecalc = data.items || data.discount !== undefined || data.taxRate !== undefined;

    if (needsRecalc) {
      const discount = resolveDiscount(data, invoice);
      const taxRate = data.taxRate !== undefined ? data.taxRate : invoice.taxRate;
      const itemsForCalc = await getItemsForCalculation(tx, id, data);
      const totals = calculateTotals(itemsForCalc, discount, taxRate);

      if (isMoneyLimitExceeded(totals, SCHEMA_LIMITS.MONEY_MAX_CENTS)) {
        throw new MoneyOverflowError();
      }

      updateData.subtotal = totals.subtotal;
      updateData.discountAmount = totals.discountAmount;
      updateData.taxAmount = totals.taxAmount;
      updateData.total = totals.total;
    }

    return tx.invoice.update({
      where: { id },
      data: updateData,
      include: INVOICE_WITH_RELATIONS_INCLUDE,
    });
  });
}
