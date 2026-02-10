import { z } from "zod";

export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

export type ApiError = z.infer<typeof apiErrorSchema>;

export const clientSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  defaultRate: z.number().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const clientListSchema = z.array(clientSchema);

export type Client = z.infer<typeof clientSchema>;

export const invoiceItemResponseSchema = z.object({
  id: z.string(),
  description: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  amount: z.number(),
});

export const invoiceEventSchema = z.object({
  id: z.string(),
  type: z.enum([
    "CREATED",
    "SENT",
    "VIEWED",
    "REMINDER_SENT",
    "PAID_MANUAL",
    "PAYMENT_RECORDED",
    "STATUS_CHANGED",
  ]),
  payload: z.unknown().optional(),
  createdAt: z.string(),
});

export type InvoiceEvent = z.infer<typeof invoiceEventSchema>;

export const paymentSchema = z.object({
  id: z.string(),
  invoiceId: z.string(),
  amount: z.number(),
  method: z.enum(["MANUAL", "BANK_TRANSFER", "CASH", "OTHER"]),
  note: z.string().nullable(),
  paidAt: z.string(),
  createdAt: z.string(),
});

export type Payment = z.infer<typeof paymentSchema>;

export const invoiceSchema = z.object({
  id: z.string(),
  publicId: z.string(),
  status: z.enum(["DRAFT", "SENT", "VIEWED", "PAID", "OVERDUE", "PARTIALLY_PAID"]),
  currency: z.string(),
  subtotal: z.number(),
  discountType: z.enum(["PERCENTAGE", "FIXED"]).nullable(),
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
  client: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
  }),
  items: z.array(invoiceItemResponseSchema),
  events: z.array(invoiceEventSchema).optional(),
  payments: z.array(paymentSchema).optional(),
});

export const invoiceListItemSchema = z.object({
  id: z.string(),
  publicId: z.string(),
  status: z.enum(["DRAFT", "SENT", "VIEWED", "PAID", "OVERDUE", "PARTIALLY_PAID"]),
  currency: z.string(),
  total: z.number(),
  paidAmount: z.number(),
  dueDate: z.string(),
  tags: z.array(z.string()),
  createdAt: z.string(),
  client: z.object({
    name: z.string(),
    email: z.string(),
  }),
});

export const invoiceListSchema = z.array(invoiceListItemSchema);

export type Invoice = z.infer<typeof invoiceSchema>;
export type InvoiceListItem = z.infer<typeof invoiceListItemSchema>;

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

export type SenderProfile = z.infer<typeof senderProfileResponseSchema>;

export const publicInvoiceSchema = z.object({
  id: z.string(),
  publicId: z.string(),
  status: z.enum(["DRAFT", "SENT", "VIEWED", "PAID", "OVERDUE", "PARTIALLY_PAID"]),
  currency: z.string(),
  subtotal: z.number(),
  total: z.number(),
  paidAmount: z.number(),
  dueDate: z.string(),
  paidAt: z.string().nullable(),
  items: z.array(invoiceItemResponseSchema),
  sender: z.object({
    companyName: z.string().nullable(),
    displayName: z.string().nullable(),
    email: z.string().nullable(),
    address: z.string().nullable(),
  }),
  client: z.object({
    name: z.string(),
    email: z.string(),
  }),
});

export type PublicInvoice = z.infer<typeof publicInvoiceSchema>;
