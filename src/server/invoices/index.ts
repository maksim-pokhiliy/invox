import { nanoid } from "nanoid";
import { prisma } from "@app/server/db";
import { CreateInvoiceInput, UpdateInvoiceInput, InvoiceItemInput } from "@app/shared/schemas";
import { InvoiceStatus, InvoiceEventType, PaymentMethod, Prisma } from "@prisma/client";

function calculateTotals(items: InvoiceItemInput[]) {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  return { subtotal, total: subtotal };
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
  const { subtotal, total } = calculateTotals(data.items);
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

  if (data.items) {
    const { subtotal, total } = calculateTotals(data.items);
    updateData.subtotal = subtotal;
    updateData.total = total;

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
