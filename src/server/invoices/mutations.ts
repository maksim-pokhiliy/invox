import { Prisma } from "@prisma/client";
import { nanoid } from "nanoid";

import { NANOID } from "@app/shared/config/config";
import { INVOICE_EVENT, INVOICE_STATUS } from "@app/shared/config/invoice-status";
import { calculateTotals, type DiscountInput } from "@app/shared/lib/calculations";
import { CreateInvoiceInput, InvoiceItemInput, UpdateInvoiceInput } from "@app/shared/schemas";

import { prisma } from "@app/server/db";

import { createItemGroups, ITEM_GROUPS_INCLUDE } from "./item-groups";

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

  if (data.notes !== undefined) {
    updateData.notes = data.notes;
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

  if (invoice.discountType && invoice.discountValue !== null) {
    return {
      type: invoice.discountType as "PERCENTAGE" | "FIXED",
      value: invoice.discountValue,
    };
  }

  return null;
}

export async function createInvoice(userId: string, data: CreateInvoiceInput) {
  const allItems = [...data.items, ...(data.itemGroups?.flatMap((g) => g.items) ?? [])];
  const { subtotal, discountAmount, taxAmount, total } = calculateTotals(
    allItems,
    data.discount,
    data.taxRate
  );
  const publicId = nanoid(NANOID.PUBLIC_ID_LENGTH);

  const invoice = await prisma.invoice.create({
    data: {
      userId,
      clientId: data.clientId,
      publicId,
      currency: data.currency,
      dueDate: data.dueDate,
      notes: data.notes,
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
    await createItemGroups(invoice.id, data.itemGroups);
  }

  await prisma.invoiceEvent.create({
    data: {
      invoiceId: invoice.id,
      type: INVOICE_EVENT.CREATED,
      payload: {},
    },
  });

  return prisma.invoice.findUniqueOrThrow({
    where: { id: invoice.id },
    include: {
      client: true,
      items: { where: { groupId: null }, orderBy: { sortOrder: "asc" } },
      itemGroups: ITEM_GROUPS_INCLUDE,
    },
  });
}

async function getItemsForCalculation(
  id: string,
  data: UpdateInvoiceInput
): Promise<InvoiceItemInput[]> {
  const hasItemChanges = data.items || data.itemGroups;

  if (hasItemChanges) {
    await prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });
    await prisma.invoiceItemGroup.deleteMany({ where: { invoiceId: id } });

    if (data.items) {
      await prisma.invoiceItem.createMany({
        data: data.items.map((item, index) => ({
          invoiceId: id,
          title: item.title,
          description: item.description ?? null,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: Math.round(item.quantity * item.unitPrice),
          sortOrder: index,
        })),
      });
    }

    if (data.itemGroups?.length) {
      await createItemGroups(id, data.itemGroups);
    }

    return [...(data.items ?? []), ...(data.itemGroups?.flatMap((g) => g.items) ?? [])];
  }

  const existingItems = await prisma.invoiceItem.findMany({ where: { invoiceId: id } });

  return existingItems.map((item) => ({
    title: item.title,
    description: item.description ?? undefined,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
  }));
}

export async function updateInvoice(id: string, userId: string, data: UpdateInvoiceInput) {
  const invoice = await prisma.invoice.findFirst({
    where: { id, userId, status: INVOICE_STATUS.DRAFT },
  });

  if (!invoice) {
    return null;
  }

  const updateData: Prisma.InvoiceUncheckedUpdateInput = {
    ...buildBasicUpdateFields(data),
    ...buildDiscountFields(data),
  };

  const needsRecalc = data.items || data.discount !== undefined || data.taxRate !== undefined;

  if (needsRecalc) {
    const discount = resolveDiscount(data, invoice);
    const taxRate = data.taxRate !== undefined ? data.taxRate : invoice.taxRate;
    const itemsForCalc = await getItemsForCalculation(id, data);
    const totals = calculateTotals(itemsForCalc, discount, taxRate);

    updateData.subtotal = totals.subtotal;
    updateData.discountAmount = totals.discountAmount;
    updateData.taxAmount = totals.taxAmount;
    updateData.total = totals.total;
  }

  return prisma.invoice.update({
    where: { id },
    data: updateData,
    include: {
      client: true,
      items: { where: { groupId: null }, orderBy: { sortOrder: "asc" } },
      itemGroups: ITEM_GROUPS_INCLUDE,
    },
  });
}

export async function deleteInvoice(id: string, userId: string) {
  const invoice = await prisma.invoice.findFirst({
    where: { id, userId },
  });

  if (!invoice) {
    return null;
  }

  await prisma.invoiceItem.deleteMany({
    where: { invoiceId: id },
  });

  await prisma.invoice.delete({
    where: { id },
  });

  return { success: true };
}
