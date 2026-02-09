import { prisma } from "@app/server/db";
import { InvoiceStatus } from "@prisma/client";
import { INVOICE_STATUS } from "@app/shared/config/invoice-status";

function computeOverdueStatus(invoice: {
  status: InvoiceStatus;
  dueDate: Date;
  paidAt: Date | null;
  paidAmount?: number;
  total?: number;
}) {
  if (invoice.status === INVOICE_STATUS.PAID || invoice.paidAt) {
    return INVOICE_STATUS.PAID;
  }
  if (
    invoice.paidAmount &&
    invoice.total &&
    invoice.paidAmount > 0 &&
    invoice.paidAmount < invoice.total
  ) {
    return INVOICE_STATUS.PARTIALLY_PAID;
  }
  if (
    invoice.status !== INVOICE_STATUS.DRAFT &&
    invoice.dueDate < new Date() &&
    invoice.status !== INVOICE_STATUS.OVERDUE
  ) {
    return INVOICE_STATUS.OVERDUE;
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
