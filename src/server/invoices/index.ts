import { nanoid } from "nanoid";
import { prisma } from "@app/server/db";
import { CreateInvoiceInput, UpdateInvoiceInput, InvoiceItemInput } from "@app/shared/schemas";
import { InvoiceStatus, InvoiceEventType, PaymentMethod, Prisma } from "@prisma/client";

interface DiscountInput {
  type: "PERCENTAGE" | "FIXED";
  value: number;
}

function calculateTotals(
  items: InvoiceItemInput[],
  discount?: DiscountInput | null,
  taxRate?: number
) {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  let discountAmount = 0;
  if (discount && discount.value > 0) {
    if (discount.type === "PERCENTAGE") {
      discountAmount = Math.round((subtotal * discount.value) / 100);
    } else {
      discountAmount = discount.value;
    }
  }

  const afterDiscount = Math.max(0, subtotal - discountAmount);

  const taxAmount = taxRate ? Math.round((afterDiscount * taxRate) / 100) : 0;

  const total = afterDiscount + taxAmount;
  return { subtotal, discountAmount, taxAmount, total };
}

function computeOverdueStatus(invoice: {
  status: InvoiceStatus;
  dueDate: Date;
  paidAt: Date | null;
  paidAmount?: number;
  total?: number;
}) {
  if (invoice.status === "PAID" || invoice.paidAt) {
    return "PAID";
  }
  if (
    invoice.paidAmount &&
    invoice.total &&
    invoice.paidAmount > 0 &&
    invoice.paidAmount < invoice.total
  ) {
    return "PARTIALLY_PAID";
  }
  if (invoice.status !== "DRAFT" && invoice.dueDate < new Date() && invoice.status !== "OVERDUE") {
    return "OVERDUE";
  }
  return invoice.status;
}

function buildBasicUpdateFields(data: UpdateInvoiceInput): Record<string, unknown> {
  const updateData: Record<string, unknown> = {};
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

function buildDiscountFields(data: UpdateInvoiceInput): Record<string, unknown> {
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

export async function getInvoices(userId: string) {
  const invoices = await prisma.invoice.findMany({
    where: { userId },
    include: {
      client: true,
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return invoices.map((invoice) => ({
    ...invoice,
    status: computeOverdueStatus(invoice),
  }));
}

export async function getInvoice(id: string, userId: string) {
  const invoice = await prisma.invoice.findFirst({
    where: { id, userId },
    include: {
      client: true,
      items: true,
      events: {
        orderBy: { createdAt: "desc" },
      },
      payments: {
        orderBy: { paidAt: "desc" },
      },
    },
  });

  if (!invoice) {
    return null;
  }

  return {
    ...invoice,
    status: computeOverdueStatus(invoice),
  };
}

export async function getInvoiceByPublicId(publicId: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { publicId },
    include: {
      client: true,
      items: true,
      user: {
        include: {
          senderProfile: true,
        },
      },
    },
  });

  if (!invoice) {
    return null;
  }

  return {
    ...invoice,
    status: computeOverdueStatus(invoice),
  };
}

export async function createInvoice(userId: string, data: CreateInvoiceInput) {
  const { subtotal, discountAmount, taxAmount, total } = calculateTotals(
    data.items,
    data.discount,
    data.taxRate
  );
  const publicId = nanoid(10);

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

  const updateData: Record<string, unknown> = {
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

  const publicId = nanoid(10);
  const newInvoice = await prisma.invoice.create({
    data: {
      userId,
      clientId: invoice.clientId,
      publicId,
      currency: invoice.currency,
      status: "DRAFT",
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
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
      type: method === "STRIPE" ? "PAID_STRIPE" : "PAID_MANUAL",
      payload: {},
    },
  });

  await prisma.followUpJob.updateMany({
    where: { invoiceId: invoice.id, status: "PENDING" },
    data: { status: "CANCELED" },
  });

  return updated;
}

export async function markInvoicePaidByCheckoutSession(checkoutSessionId: string) {
  const invoice = await prisma.invoice.findFirst({
    where: { stripeCheckoutSessionId: checkoutSessionId, paidAt: null },
  });

  if (!invoice) {
    return null;
  }

  const updated = await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      status: "PAID",
      paidAt: new Date(),
      paymentMethod: "STRIPE",
    },
  });

  await prisma.invoiceEvent.create({
    data: {
      invoiceId: invoice.id,
      type: "PAID_STRIPE",
      payload: { checkoutSessionId },
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

export interface RecordPaymentInput {
  amount: number;
  method: PaymentMethod;
  note?: string;
  paidAt?: Date;
}

export async function recordPayment(id: string, userId: string, data: RecordPaymentInput) {
  const invoice = await prisma.invoice.findFirst({
    where: { id, userId },
  });

  if (!invoice) {
    return null;
  }

  if (invoice.status === "DRAFT") {
    return null;
  }

  const remainingBalance = invoice.total - invoice.paidAmount;
  if (data.amount > remainingBalance) {
    return null;
  }

  const newPaidAmount = invoice.paidAmount + data.amount;
  const isFullyPaid = newPaidAmount >= invoice.total;

  const payment = await prisma.payment.create({
    data: {
      invoiceId: id,
      amount: data.amount,
      method: data.method,
      note: data.note,
      paidAt: data.paidAt || new Date(),
    },
  });

  const updatedInvoice = await prisma.invoice.update({
    where: { id },
    data: {
      paidAmount: newPaidAmount,
      status: isFullyPaid ? "PAID" : "PARTIALLY_PAID",
      paidAt: isFullyPaid ? new Date() : null,
      paymentMethod: isFullyPaid ? data.method : null,
    },
    include: {
      client: true,
      items: true,
      payments: {
        orderBy: { paidAt: "desc" },
      },
    },
  });

  await prisma.invoiceEvent.create({
    data: {
      invoiceId: id,
      type: "PAYMENT_RECORDED",
      payload: {
        amount: data.amount,
        method: data.method,
        note: data.note,
        paymentId: payment.id,
      },
    },
  });

  if (isFullyPaid) {
    await prisma.followUpJob.updateMany({
      where: { invoiceId: id, status: "PENDING" },
      data: { status: "CANCELED" },
    });
  }

  return updatedInvoice;
}

export async function getPayments(invoiceId: string, userId: string) {
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, userId },
  });

  if (!invoice) {
    return null;
  }

  return prisma.payment.findMany({
    where: { invoiceId },
    orderBy: { paidAt: "desc" },
  });
}

export async function deletePayment(paymentId: string, userId: string) {
  const payment = await prisma.payment.findFirst({
    where: { id: paymentId },
    include: {
      invoice: true,
    },
  });

  if (!payment || payment.invoice.userId !== userId) {
    return null;
  }

  if (payment.invoice.status === "PAID") {
    return null;
  }

  const newPaidAmount = payment.invoice.paidAmount - payment.amount;

  await prisma.payment.delete({
    where: { id: paymentId },
  });

  let newStatus: "PARTIALLY_PAID" | "VIEWED" | "SENT";
  if (newPaidAmount > 0) {
    newStatus = "PARTIALLY_PAID";
  } else if (payment.invoice.viewedAt) {
    newStatus = "VIEWED";
  } else {
    newStatus = "SENT";
  }

  const updatedInvoice = await prisma.invoice.update({
    where: { id: payment.invoiceId },
    data: {
      paidAmount: newPaidAmount,
      status: newStatus,
    },
    include: {
      client: true,
      items: true,
      payments: {
        orderBy: { paidAt: "desc" },
      },
    },
  });

  return updatedInvoice;
}
