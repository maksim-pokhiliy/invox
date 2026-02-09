import { prisma } from "@app/server/db";
import { InvoiceStatus, InvoiceEventType, PaymentMethod, Prisma } from "@prisma/client";
import { INVOICE_STATUS, INVOICE_EVENT, FOLLOWUP_STATUS } from "@app/shared/config/invoice-status";

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
      status: invoice.status === INVOICE_STATUS.SENT ? INVOICE_STATUS.VIEWED : invoice.status,
    },
  });

  await prisma.invoiceEvent.create({
    data: {
      invoiceId: invoice.id,
      type: INVOICE_EVENT.VIEWED,
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
      status: INVOICE_STATUS.PAID,
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
      type: INVOICE_EVENT.PAID_MANUAL,
      payload: {},
    },
  });

  await prisma.followUpJob.updateMany({
    where: { invoiceId: invoice.id, status: FOLLOWUP_STATUS.PENDING },
    data: { status: FOLLOWUP_STATUS.CANCELED },
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
