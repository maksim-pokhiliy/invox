import { z } from "zod";

export const invoiceItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().int().min(0, "Unit price must be non-negative"),
});

// Tag validation
const tagSchema = z.string().min(1).max(30);

// Discount schema
export const discountTypeSchema = z.enum(["PERCENTAGE", "FIXED"]);
export type DiscountType = z.infer<typeof discountTypeSchema>;

export const discountSchema = z
  .object({
    type: discountTypeSchema,
    value: z.number().min(0),
  })
  .nullable()
  .optional();

// Form schema for React Hook Form (no transforms, no defaults)
export const invoiceFormSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  currency: z.string().min(1, "Currency is required"),
  dueDate: z.string().min(1, "Due date is required"),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
  notes: z.string().optional(),
  tags: z.array(tagSchema).optional(),
  discount: discountSchema,
  taxRate: z.number().min(0).max(100).optional(), // Tax rate as percentage
});

// API schema with date transform
export const createInvoiceSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  currency: z.string().default("USD"),
  dueDate: z
    .string()
    .or(z.date())
    .transform((val) => new Date(val)),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
  notes: z.string().optional(),
  tags: z.array(tagSchema).optional(),
  discount: discountSchema,
  taxRate: z.number().min(0).max(100).optional(),
});

export const updateInvoiceSchema = z.object({
  clientId: z.string().optional(),
  currency: z.string().optional(),
  dueDate: z
    .string()
    .or(z.date())
    .transform((val) => new Date(val))
    .optional(),
  items: z.array(invoiceItemSchema).optional(),
  notes: z.string().optional().nullable(),
  tags: z.array(tagSchema).optional(),
  discount: discountSchema,
  taxRate: z.number().min(0).max(100).optional(),
});

export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>;
export type InvoiceFormInput = z.infer<typeof invoiceFormSchema>;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
