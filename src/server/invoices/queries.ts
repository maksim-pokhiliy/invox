import { InvoiceStatus, Prisma } from "@prisma/client";

import { INVOICE_STATUS, type InvoiceStatusValue } from "@app/shared/config/invoice-status";
import { isOverdue } from "@app/shared/lib/invoice-status-predicates";
import type { InvoiceId, PublicId, UserId } from "@app/shared/types/ids";

import { prisma } from "@app/server/db";

import {
  INVOICE_DETAIL_INCLUDE,
  INVOICE_LIST_INCLUDE,
  type InvoiceDetailDTO,
  type InvoiceListItemDTO,
  toInvoiceDetailDTO,
  toInvoiceListItemDTO,
} from "./invoice-dto";
import { ITEM_GROUPS_INCLUDE } from "./item-groups";

const INVOICE_PUBLIC_INCLUDE = {
  client: true,
  items: { where: { groupId: null }, orderBy: { sortOrder: "asc" } },
  itemGroups: ITEM_GROUPS_INCLUDE,
  user: { include: { senderProfile: true } },
} as const satisfies Prisma.InvoiceInclude;

type InvoicePublicRow = Prisma.InvoiceGetPayload<{ include: typeof INVOICE_PUBLIC_INCLUDE }>;

export type InvoicePublicEntity = Omit<InvoicePublicRow, "status"> & { status: InvoiceStatus };

function computeOverdueStatus(invoice: {
  status: InvoiceStatus;
  dueDate: Date;
  paidAt: Date | null;
  paidAmount?: number;
  total?: number;
}): InvoiceStatusValue {
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

  if (isOverdue(invoice, new Date())) {
    return INVOICE_STATUS.OVERDUE;
  }

  return invoice.status;
}

export async function getInvoices(userId: UserId): Promise<InvoiceListItemDTO[]> {
  const invoices = await prisma.invoice.findMany({
    where: { userId },
    include: INVOICE_LIST_INCLUDE,
    orderBy: { createdAt: "desc" },
  });

  return invoices.map((invoice) => toInvoiceListItemDTO(invoice, computeOverdueStatus(invoice)));
}

export async function getInvoice(id: InvoiceId, userId: UserId): Promise<InvoiceDetailDTO | null> {
  const invoice = await prisma.invoice.findFirst({
    where: { id, userId },
    include: INVOICE_DETAIL_INCLUDE,
  });

  if (!invoice) {
    return null;
  }

  return toInvoiceDetailDTO(invoice, computeOverdueStatus(invoice));
}

export async function getInvoiceByPublicId(
  publicId: PublicId
): Promise<InvoicePublicEntity | null> {
  const invoice = await prisma.invoice.findUnique({
    where: { publicId },
    include: INVOICE_PUBLIC_INCLUDE,
  });

  if (!invoice) {
    return null;
  }

  return {
    ...invoice,
    status: computeOverdueStatus(invoice),
  };
}
