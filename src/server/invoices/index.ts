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

  // Calculate tax on the discounted amount
  const taxAmount = taxRate ? Math.round((afterDiscount * taxRate) / 100) : 0;

  const total = afterDiscount + taxAmount;
  return { subtotal, discountAmount, taxAmount, total };
}

function computeOverdueStatus(invoice: {
  status: InvoiceStatus;
  dueDate: Date;
  paidAt: Date | null;
}) {
  if (invoice.status === "PAID" || invoice.paidAt) {
    return "PAID";
  }
  if (invoice.status !== "DRAFT" && invoice.dueDate < new Date() && invoice.status !== "OVERDUE") {
    return "OVERDUE";
  }
  return invoice.status;
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

export async function updateInvoice(id: string, userId: string, data: UpdateInvoiceInput) {
  const invoice = await prisma.invoice.findFirst({
    where: { id, userId, status: "DRAFT" },
  });

  if (!invoice) {
    return null;
  }

  const updateData: Record<string, unknown> = {};

  if (data.clientId) updateData.clientId = data.clientId;
  if (data.currency) updateData.currency = data.currency;
  if (data.dueDate) updateData.dueDate = data.dueDate;
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.tags !== undefined) updateData.tags = data.tags;

  // Handle discount update
  if (data.discount !== undefined) {
    if (data.discount) {
      updateData.discountType = data.discount.type;
      updateData.discountValue = data.discount.value;
    } else {
      updateData.discountType = null;
      updateData.discountValue = 0;
      updateData.discountAmount = 0;
    }
  }

  // Handle tax rate update
  if (data.taxRate !== undefined) {
    updateData.taxRate = data.taxRate;
  }

  // Determine if we need to recalculate totals
  const needsRecalc = data.items || data.discount !== undefined || data.taxRate !== undefined;

  if (needsRecalc) {
    const discount =
      data.discount !== undefined
        ? data.discount
        : invoice.discountType
          ? { type: invoice.discountType, value: invoice.discountValue }
          : null;
    const taxRate = data.taxRate !== undefined ? data.taxRate : invoice.taxRate;

    let itemsForCalc: InvoiceItemInput[];
    if (data.items) {
      itemsForCalc = data.items;

      await prisma.invoiceItem.deleteMany({
        where: { invoiceId: id },
      });

      await prisma.invoiceItem.createMany({
        data: data.items.map((item) => ({
          invoiceId: id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.quantity * item.unitPrice,
        })),
      });
    } else {
      const existingItems = await prisma.invoiceItem.findMany({
        where: { invoiceId: id },
      });
      itemsForCalc = existingItems.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }));
    }

    const { subtotal, discountAmount, taxAmount, total } = calculateTotals(
      itemsForCalc,
      discount,
      taxRate
    );
    updateData.subtotal = subtotal;
    updateData.discountAmount = discountAmount;
    updateData.taxAmount = taxAmount;
    updateData.total = total;
  }

  return prisma.invoice.update({
    where: { id },
    data: updateData,
    include: {
      client: true,
      items: true,
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

  // Delete related items first
  await prisma.invoiceItem.deleteMany({
    where: { invoiceId: id },
  });

  // Delete the invoice
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

  // Create a new invoice with the same data
  const publicId = nanoid(10);
  const newInvoice = await prisma.invoice.create({
    data: {
      userId,
      clientId: invoice.clientId,
      publicId,
      currency: invoice.currency,
      status: "DRAFT",
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
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
