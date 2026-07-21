import type { Prisma } from "@prisma/client";

import {
  type DiscountTypeValue,
  type InvoiceEventValue,
  type InvoiceStatusValue,
  isDiscountType,
} from "@app/shared/config/invoice-status";
import type { PaymentMethodValue } from "@app/shared/config/payment-method";
import { parseInvoiceTags } from "@app/shared/schemas/invoice";
import { asCents, type Cents } from "@app/shared/types/money";

import { ITEM_GROUPS_INCLUDE } from "./item-groups";

const INVOICE_DETAIL_HISTORY_TAKE = 200;

export const INVOICE_LIST_INCLUDE = {
  client: true,
} as const satisfies Prisma.InvoiceInclude;

export const INVOICE_DETAIL_INCLUDE = {
  client: true,
  items: { where: { groupId: null }, orderBy: { sortOrder: "asc" } },
  itemGroups: ITEM_GROUPS_INCLUDE,
  events: { orderBy: { createdAt: "desc" }, take: INVOICE_DETAIL_HISTORY_TAKE },
  payments: { orderBy: { paidAt: "desc" }, take: INVOICE_DETAIL_HISTORY_TAKE },
} as const satisfies Prisma.InvoiceInclude;

export type InvoiceListRow = Prisma.InvoiceGetPayload<{ include: typeof INVOICE_LIST_INCLUDE }>;
export type InvoiceDetailRow = Prisma.InvoiceGetPayload<{ include: typeof INVOICE_DETAIL_INCLUDE }>;

export interface InvoiceClientRefDTO {
  id: string;
  name: string;
  email: string;
}

export interface InvoiceClientBriefDTO {
  name: string;
  email: string;
}

export interface InvoiceItemDTO {
  id: string;
  title: string;
  description: string | null;
  quantity: number;
  unitPrice: Cents;
  amount: Cents;
  sortOrder: number;
  serviceId: string | null;
}

export interface InvoiceItemGroupDTO {
  id: string;
  title: string;
  sortOrder: number;
  items: InvoiceItemDTO[];
}

export interface InvoiceEventDTO {
  id: string;
  type: InvoiceEventValue;
  payload: unknown;
  createdAt: string;
}

export interface InvoicePaymentDTO {
  id: string;
  invoiceId: string;
  amount: Cents;
  method: PaymentMethodValue;
  note: string | null;
  paidAt: string;
  createdAt: string;
}

export interface InvoiceListItemDTO {
  id: string;
  publicId: string;
  status: InvoiceStatusValue;
  currency: string;
  total: Cents;
  paidAmount: Cents;
  dueDate: string;
  tags: string[];
  createdAt: string;
  client: InvoiceClientBriefDTO;
}

export interface InvoiceDetailDTO {
  id: string;
  publicId: string;
  status: InvoiceStatusValue;
  currency: string;
  subtotal: Cents;
  discountType: DiscountTypeValue | null;
  discountValue: number;
  discountAmount: Cents;
  taxRate: number;
  taxAmount: Cents;
  total: Cents;
  paidAmount: Cents;
  dueDate: string;
  periodStart: string | null;
  periodEnd: string | null;
  notes: string | null;
  message: string | null;
  tags: string[];
  sentAt: string | null;
  viewedAt: string | null;
  paidAt: string | null;
  paymentMethod: string | null;
  createdAt: string;
  updatedAt: string;
  client: InvoiceClientRefDTO;
  items: InvoiceItemDTO[];
  itemGroups: InvoiceItemGroupDTO[];
  events: InvoiceEventDTO[];
  payments: InvoicePaymentDTO[];
}

function toItemDTO(item: InvoiceDetailRow["items"][number]): InvoiceItemDTO {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    quantity: item.quantity,
    unitPrice: asCents(item.unitPrice),
    amount: asCents(item.amount),
    sortOrder: item.sortOrder,
    serviceId: item.serviceId ?? null,
  };
}

function toItemGroupDTO(group: InvoiceDetailRow["itemGroups"][number]): InvoiceItemGroupDTO {
  return {
    id: group.id,
    title: group.title,
    sortOrder: group.sortOrder,
    items: group.items.map(toItemDTO),
  };
}

function toEventDTO(event: InvoiceDetailRow["events"][number]): InvoiceEventDTO {
  return {
    id: event.id,
    type: event.type as InvoiceEventValue,
    payload: event.payload,
    createdAt: event.createdAt.toISOString(),
  };
}

function toPaymentDTO(payment: InvoiceDetailRow["payments"][number]): InvoicePaymentDTO {
  return {
    id: payment.id,
    invoiceId: payment.invoiceId,
    amount: asCents(payment.amount),
    method: payment.method as PaymentMethodValue,
    note: payment.note,
    paidAt: payment.paidAt.toISOString(),
    createdAt: payment.createdAt.toISOString(),
  };
}

export function toInvoiceListItemDTO(
  row: InvoiceListRow,
  status: InvoiceStatusValue
): InvoiceListItemDTO {
  return {
    id: row.id,
    publicId: row.publicId,
    status,
    currency: row.currency,
    total: asCents(row.total),
    paidAmount: asCents(row.paidAmount),
    dueDate: row.dueDate.toISOString(),
    tags: parseInvoiceTags(row.tags),
    createdAt: row.createdAt.toISOString(),
    client: {
      name: row.client.name,
      email: row.client.email,
    },
  };
}

export function toInvoiceDetailDTO(
  row: InvoiceDetailRow,
  status: InvoiceStatusValue
): InvoiceDetailDTO {
  return {
    id: row.id,
    publicId: row.publicId,
    status,
    currency: row.currency,
    subtotal: asCents(row.subtotal),
    discountType: isDiscountType(row.discountType) ? row.discountType : null,
    discountValue: row.discountValue,
    discountAmount: asCents(row.discountAmount),
    taxRate: row.taxRate,
    taxAmount: asCents(row.taxAmount),
    total: asCents(row.total),
    paidAmount: asCents(row.paidAmount),
    dueDate: row.dueDate.toISOString(),
    periodStart: row.periodStart?.toISOString() ?? null,
    periodEnd: row.periodEnd?.toISOString() ?? null,
    notes: row.notes,
    message: row.message,
    tags: parseInvoiceTags(row.tags),
    sentAt: row.sentAt?.toISOString() ?? null,
    viewedAt: row.viewedAt?.toISOString() ?? null,
    paidAt: row.paidAt?.toISOString() ?? null,
    paymentMethod: row.paymentMethod,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    client: {
      id: row.client.id,
      name: row.client.name,
      email: row.client.email,
    },
    items: row.items.map(toItemDTO),
    itemGroups: row.itemGroups.map(toItemGroupDTO),
    events: row.events.map(toEventDTO),
    payments: row.payments.map(toPaymentDTO),
  };
}
