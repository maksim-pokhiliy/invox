import { z } from "zod";

import { DISCOUNT_TYPE, INVOICE_EVENT, INVOICE_STATUS } from "@app/shared/config/invoice-status";
import { PAYMENT_METHOD } from "@app/shared/config/payment-method";

const invoiceStatusSchema = z.nativeEnum(INVOICE_STATUS);
const invoiceEventTypeSchema = z.nativeEnum(INVOICE_EVENT);
const discountTypeSchema = z.nativeEnum(DISCOUNT_TYPE);
const paymentMethodSchema = z.nativeEnum(PAYMENT_METHOD);

const clientRefSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
});

const clientBriefSchema = z.object({
  name: z.string(),
  email: z.string(),
});

export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

export const clientSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  defaultRate: z.number().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const clientListSchema = z.array(clientSchema);

export const invoiceItemResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  quantity: z.number(),
  unitPrice: z.number(),
  amount: z.number(),
  sortOrder: z.number().optional(),
});

export const invoiceItemGroupResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  sortOrder: z.number().optional(),
  items: z.array(invoiceItemResponseSchema),
});

export const invoiceEventSchema = z.object({
  id: z.string(),
  type: invoiceEventTypeSchema,
  payload: z.unknown().optional(),
  createdAt: z.string(),
});

export const paymentSchema = z.object({
  id: z.string(),
  invoiceId: z.string(),
  amount: z.number(),
  method: paymentMethodSchema,
  note: z.string().nullable(),
  paidAt: z.string(),
  createdAt: z.string(),
});

export const invoiceSchema = z.object({
  id: z.string(),
  publicId: z.string(),
  status: invoiceStatusSchema,
  currency: z.string(),
  subtotal: z.number(),
  discountType: discountTypeSchema.nullable(),
  discountValue: z.number(),
  discountAmount: z.number(),
  taxRate: z.number(),
  taxAmount: z.number(),
  total: z.number(),
  paidAmount: z.number(),
  dueDate: z.string(),
  notes: z.string().nullable(),
  tags: z.array(z.string()),
  sentAt: z.string().nullable(),
  viewedAt: z.string().nullable(),
  paidAt: z.string().nullable(),
  paymentMethod: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  client: clientRefSchema,
  items: z.array(invoiceItemResponseSchema),
  itemGroups: z.array(invoiceItemGroupResponseSchema).optional(),
  events: z.array(invoiceEventSchema).optional(),
  payments: z.array(paymentSchema).optional(),
});

export const invoiceListItemSchema = z.object({
  id: z.string(),
  publicId: z.string(),
  status: invoiceStatusSchema,
  currency: z.string(),
  total: z.number(),
  paidAmount: z.number(),
  dueDate: z.string(),
  tags: z.array(z.string()),
  createdAt: z.string(),
  client: clientBriefSchema,
});

export const invoiceListSchema = z.array(invoiceListItemSchema);

export const senderProfileResponseSchema = z.object({
  id: z.string(),
  companyName: z.string().nullable(),
  displayName: z.string().nullable(),
  emailFrom: z.string().nullable(),
  address: z.string().nullable(),
  taxId: z.string().nullable(),
  defaultCurrency: z.string(),
  logoUrl: z.string().nullable(),
  primaryColor: z.string().nullable(),
  accentColor: z.string().nullable(),
  footerText: z.string().nullable(),
  fontFamily: z.string().nullable(),
  invoicePrefix: z.string().nullable(),
  defaultRate: z.number().nullable(),
});

export const publicInvoiceSchema = z.object({
  id: z.string(),
  publicId: z.string(),
  status: invoiceStatusSchema,
  currency: z.string(),
  subtotal: z.number(),
  total: z.number(),
  paidAmount: z.number(),
  dueDate: z.string(),
  paidAt: z.string().nullable(),
  items: z.array(invoiceItemResponseSchema),
  itemGroups: z.array(invoiceItemGroupResponseSchema).optional(),
  sender: z.object({
    companyName: z.string().nullable(),
    displayName: z.string().nullable(),
    email: z.string().nullable(),
    address: z.string().nullable(),
  }),
  client: clientBriefSchema,
});

export type ApiError = z.infer<typeof apiErrorSchema>;
export type Client = z.infer<typeof clientSchema>;
export type InvoiceItemResponse = z.infer<typeof invoiceItemResponseSchema>;
export type InvoiceItemGroupResponse = z.infer<typeof invoiceItemGroupResponseSchema>;
export type InvoiceEvent = z.infer<typeof invoiceEventSchema>;
export type Payment = z.infer<typeof paymentSchema>;
export type Invoice = z.infer<typeof invoiceSchema>;
export type InvoiceListItem = z.infer<typeof invoiceListItemSchema>;
export type SenderProfile = z.infer<typeof senderProfileResponseSchema>;
export type PublicInvoice = z.infer<typeof publicInvoiceSchema>;
