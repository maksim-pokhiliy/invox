import { prisma } from "@app/server/db";
import { PaymentMethod } from "@prisma/client";

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

    await tx.invoiceEvent.create({
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
      await tx.followUpJob.updateMany({
        where: { invoiceId: id, status: "PENDING" },
        data: { status: "CANCELED" },
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

  if (payment.invoice.status === "PAID") {
    return null;
  }

  const newPaidAmount = payment.invoice.paidAmount - payment.amount;

  let newStatus: "PARTIALLY_PAID" | "VIEWED" | "SENT";
  if (newPaidAmount > 0) {
    newStatus = "PARTIALLY_PAID";
  } else if (payment.invoice.viewedAt) {
    newStatus = "VIEWED";
  } else {
    newStatus = "SENT";
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
