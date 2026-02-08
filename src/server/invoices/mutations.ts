import { nanoid } from "nanoid";
import { prisma } from "@app/server/db";
import { CreateInvoiceInput, UpdateInvoiceInput, InvoiceItemInput } from "@app/shared/schemas";
import { InvoiceStatus, InvoiceEventType, PaymentMethod, Prisma } from "@prisma/client";
import { NANOID, INVOICE, TIME } from "@app/shared/config/config";
import { calculateTotals, type DiscountInput } from "@app/shared/lib/calculations";

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
  const { subtotal, discountAmount, taxAmount, total } = calculateTotals(
    data.items,
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
      status: "DRAFT",
      items: {
        create: data.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.quantity * item.unitPrice,
        })),
      },
    },
    include: {
      client: true,
      items: true,
    },
  });

  await prisma.invoiceEvent.create({
    data: {
      invoiceId: invoice.id,
      type: "CREATED",
      payload: {},
    },
  });

  return invoice;
}

async function getItemsForCalculation(
  id: string,
  data: UpdateInvoiceInput
): Promise<InvoiceItemInput[]> {
  if (data.items) {
    await prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });
    await prisma.invoiceItem.createMany({
      data: data.items.map((item) => ({
        invoiceId: id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.quantity * item.unitPrice,
      })),
    });
    return data.items;
  }
  const existingItems = await prisma.invoiceItem.findMany({ where: { invoiceId: id } });
  return existingItems.map((item) => ({
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
  }));
}

export async function updateInvoice(id: string, userId: string, data: UpdateInvoiceInput) {
  const invoice = await prisma.invoice.findFirst({
    where: { id, userId, status: "DRAFT" },
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
    include: { client: true, items: true },
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

export async function duplicateInvoice(id: string, userId: string) {
  const invoice = await prisma.invoice.findFirst({
    where: { id, userId },
    include: {
      items: true,
    },
  });

  if (!invoice) {
    return null;
  }

  const publicId = nanoid(NANOID.PUBLIC_ID_LENGTH);
  const newInvoice = await prisma.invoice.create({
    data: {
      userId,
      clientId: invoice.clientId,
      publicId,
      currency: invoice.currency,
      status: "DRAFT",
      dueDate: new Date(Date.now() + INVOICE.DEFAULT_DUE_DAYS * TIME.DAY),
      subtotal: invoice.subtotal,
      total: invoice.total,
      tags: invoice.tags as string[],
      items: {
        create: invoice.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.amount,
        })),
      },
    },
    include: {
      client: true,
      items: true,
    },
  });

  return newInvoice;
}

export async function markInvoiceViewed(publicId: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { publicId },
  });

  if (!invoice || invoice.viewedAt) {
    return invoice;
  }

  const updated = await prisma.invoice.update({
    where: { publicId },
    data: {
      viewedAt: new Date(),
      status: invoice.status === "SENT" ? "VIEWED" : invoice.status,
    },
  });

  await prisma.invoiceEvent.create({
    data: {
      invoiceId: invoice.id,
      type: "VIEWED",
      payload: {},
    },
  });

  return updated;
}

export async function markInvoicePaid(
  id: string,
  userId: string,
  method: PaymentMethod = "MANUAL"
) {
  const invoice = await prisma.invoice.findFirst({
    where: { id, userId, paidAt: null },
  });

  if (!invoice) {
    return null;
  }

  const updated = await prisma.invoice.update({
    where: { id },
    data: {
      status: "PAID",
      paidAt: new Date(),
      paymentMethod: method,
    },
    include: {
      client: true,
      items: true,
    },
  });

  await prisma.invoiceEvent.create({
    data: {
      invoiceId: invoice.id,
      type: "PAID_MANUAL",
      payload: {},
    },
  });

  await prisma.followUpJob.updateMany({
    where: { invoiceId: invoice.id, status: "PENDING" },
    data: { status: "CANCELED" },
  });

  return updated;
}

export async function updateInvoiceStatus(
  id: string,
  status: InvoiceStatus,
  additionalData: Record<string, unknown> = {}
) {
  return prisma.invoice.update({
    where: { id },
    data: {
      status,
      ...additionalData,
    },
  });
}

export async function logInvoiceEvent(
  invoiceId: string,
  type: InvoiceEventType,
  payload: Prisma.InputJsonValue = {}
) {
  return prisma.invoiceEvent.create({
    data: {
      invoiceId,
      type,
      payload,
    },
  });
}
