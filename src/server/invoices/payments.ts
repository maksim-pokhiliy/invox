import { prisma } from "@app/server/db";
import { PaymentMethod } from "@prisma/client";
import {
  INVOICE_STATUS,
  INVOICE_EVENT,
  FOLLOWUP_STATUS,
  type InvoiceStatusValue,
} from "@app/shared/config/invoice-status";

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

  if (invoice.status === INVOICE_STATUS.DRAFT) {
    return null;
  }

  const remainingBalance = invoice.total - invoice.paidAmount;
  if (data.amount > remainingBalance) {
    return null;
  }

  const newPaidAmount = invoice.paidAmount + data.amount;
  const isFullyPaid = newPaidAmount >= invoice.total;

  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        invoiceId: id,
        amount: data.amount,
        method: data.method,
        note: data.note,
        paidAt: data.paidAt || new Date(),
      },
    });

    const updatedInvoice = await tx.invoice.update({
      where: { id },
      data: {
        paidAmount: newPaidAmount,
        status: isFullyPaid ? INVOICE_STATUS.PAID : INVOICE_STATUS.PARTIALLY_PAID,
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

    await tx.invoiceEvent.create({
      data: {
        invoiceId: id,
        type: INVOICE_EVENT.PAYMENT_RECORDED,
        payload: {
          amount: data.amount,
          method: data.method,
          note: data.note,
          paymentId: payment.id,
        },
      },
    });

    if (isFullyPaid) {
      await tx.followUpJob.updateMany({
        where: { invoiceId: id, status: FOLLOWUP_STATUS.PENDING },
        data: { status: FOLLOWUP_STATUS.CANCELED },
      });
    }

    return updatedInvoice;
  });
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

  if (payment.invoice.status === INVOICE_STATUS.PAID) {
    return null;
  }

  const newPaidAmount = payment.invoice.paidAmount - payment.amount;

  let newStatus: InvoiceStatusValue;
  if (newPaidAmount > 0) {
    newStatus = INVOICE_STATUS.PARTIALLY_PAID;
  } else if (payment.invoice.viewedAt) {
    newStatus = INVOICE_STATUS.VIEWED;
  } else {
    newStatus = INVOICE_STATUS.SENT;
  }

  return prisma.$transaction(async (tx) => {
    await tx.payment.delete({
      where: { id: paymentId },
    });

    return tx.invoice.update({
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
  });
}
