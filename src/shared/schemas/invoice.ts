import { z } from "zod";

import { BRANDING, INVOICE } from "@app/shared/config/config";
import { DISCOUNT_TYPE } from "@app/shared/config/invoice-status";

import { lineItemGroupSchema, lineItemSchema } from "./line-item";

export const invoiceItemSchema = lineItemSchema;
export const invoiceItemGroupSchema = lineItemGroupSchema;

const tagSchema = z.string().min(1).max(30);

export const discountTypeSchema = z.nativeEnum(DISCOUNT_TYPE);

export const discountSchema = z
  .object({
    type: discountTypeSchema,
    value: z.number().min(0),
  })
  .nullable()
  .optional();

export const invoiceFormSchema = z
  .object({
    clientId: z.string().min(1, "Client is required"),
    currency: z.string().min(1, "Currency is required"),
    dueDate: z.string().min(1, "Due date is required"),
    items: z.array(invoiceItemSchema),
    itemGroups: z.array(invoiceItemGroupSchema).optional(),
    notes: z.string().optional(),
    tags: z.array(tagSchema).optional(),
    discount: discountSchema,
    taxRate: z.number().min(0).max(INVOICE.MAX_TAX_RATE).optional(),
  })
  .refine(
    (data) => {
      const ungroupedCount = data.items.length;
      const groupedCount = data.itemGroups?.reduce((sum, g) => sum + g.items.length, 0) ?? 0;

      return ungroupedCount + groupedCount > 0;
    },
    { message: "At least one item is required", path: ["items"] }
  );

export const createInvoiceSchema = z
  .object({
    clientId: z.string().min(1, "Client is required"),
    currency: z.string().default(BRANDING.DEFAULT_CURRENCY),
    dueDate: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val)),
    items: z.array(invoiceItemSchema),
    itemGroups: z.array(invoiceItemGroupSchema).optional(),
    notes: z.string().optional(),
    tags: z.array(tagSchema).optional(),
    discount: discountSchema,
    taxRate: z.number().min(0).max(INVOICE.MAX_TAX_RATE).optional(),
  })
  .refine(
    (data) => {
      const ungroupedCount = data.items.length;
      const groupedCount = data.itemGroups?.reduce((sum, g) => sum + g.items.length, 0) ?? 0;

      return ungroupedCount + groupedCount > 0;
    },
    { message: "At least one item is required", path: ["items"] }
  );

export const updateInvoiceSchema = z.object({
  clientId: z.string().optional(),
  currency: z.string().optional(),
  dueDate: z
    .string()
    .or(z.date())
    .transform((val) => new Date(val))
    .optional(),
  items: z.array(invoiceItemSchema).optional(),
  itemGroups: z.array(invoiceItemGroupSchema).optional(),
  notes: z.string().optional().nullable(),
  tags: z.array(tagSchema).optional(),
  discount: discountSchema,
  taxRate: z.number().min(0).max(INVOICE.MAX_TAX_RATE).optional(),
});

export type DiscountType = z.infer<typeof discountTypeSchema>;
export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>;
export type InvoiceItemGroupInput = z.infer<typeof invoiceItemGroupSchema>;
export type InvoiceFormInput = z.infer<typeof invoiceFormSchema>;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
