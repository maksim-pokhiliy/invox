import { z } from "zod";

// Generic API error response
export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

export type ApiError = z.infer<typeof apiErrorSchema>;

// Client response schema
export const clientSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const clientListSchema = z.array(clientSchema);

export type Client = z.infer<typeof clientSchema>;

// Invoice item response schema
export const invoiceItemResponseSchema = z.object({
  id: z.string(),
  description: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  amount: z.number(),
});

// Invoice response schema
export const invoiceSchema = z.object({
  id: z.string(),
  publicId: z.string(),
  status: z.enum(["DRAFT", "SENT", "VIEWED", "PAID", "OVERDUE"]),
  currency: z.string(),
  subtotal: z.number(),
  discountType: z.enum(["PERCENTAGE", "FIXED"]).nullable(),
  discountValue: z.number(),
  discountAmount: z.number(),
  taxRate: z.number(),
  taxAmount: z.number(),
  total: z.number(),
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
});

export const invoiceListItemSchema = z.object({
  id: z.string(),
  publicId: z.string(),
  status: z.enum(["DRAFT", "SENT", "VIEWED", "PAID", "OVERDUE"]),
  currency: z.string(),
  total: z.number(),
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

// Sender profile response schema
export const senderProfileResponseSchema = z.object({
  id: z.string(),
  companyName: z.string().nullable(),
  displayName: z.string().nullable(),
  emailFrom: z.string().nullable(),
  address: z.string().nullable(),
  taxId: z.string().nullable(),
  defaultCurrency: z.string(),
  stripeAccountId: z.string().nullable(),
});

export type SenderProfile = z.infer<typeof senderProfileResponseSchema>;

// Public invoice response schema (for payment page)
export const publicInvoiceSchema = z.object({
  id: z.string(),
  publicId: z.string(),
  status: z.enum(["DRAFT", "SENT", "VIEWED", "PAID", "OVERDUE"]),
  currency: z.string(),
  subtotal: z.number(),
  total: z.number(),
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
  stripeEnabled: z.boolean(),
});

export type PublicInvoice = z.infer<typeof publicInvoiceSchema>;

// Checkout session response
export const checkoutSessionSchema = z.object({
  url: z.string(),
});

export type CheckoutSession = z.infer<typeof checkoutSessionSchema>;
