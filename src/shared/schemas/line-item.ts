import { z } from "zod";

import { asCents } from "@app/shared/types/money";

import { SCHEMA_LIMITS } from "./limits";

export const lineItemSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(SCHEMA_LIMITS.LINE_ITEM_TITLE_MAX),
    description: z.string().max(SCHEMA_LIMITS.LINE_ITEM_DESCRIPTION_MAX).optional(),
    quantity: z
      .number()
      .min(0.01, "Quantity is required")
      .max(SCHEMA_LIMITS.QUANTITY_MAX, "Quantity is too large"),
    unitPrice: z
      .number()
      .min(0, "Unit price must be non-negative")
      .max(SCHEMA_LIMITS.MONEY_MAX_LINE_ITEM_CENTS, "Unit price is too large")
      .transform(asCents),
    sortOrder: z.number().int().optional(),
    serviceId: z.string().optional(),
  })
  .refine((item) => Math.round(item.quantity * item.unitPrice) <= SCHEMA_LIMITS.MONEY_MAX_CENTS, {
    message: "Line item total is too large",
    path: ["unitPrice"],
  });

export const lineItemGroupSchema = z.object({
  title: z.string().min(1, "Group title is required").max(SCHEMA_LIMITS.LINE_ITEM_GROUP_TITLE_MAX),
  sortOrder: z.number().int().optional(),
  items: z.array(lineItemSchema).max(SCHEMA_LIMITS.INVOICE_ITEMS_MAX, "Too many line items"),
});

export type LineItemInput = z.infer<typeof lineItemSchema>;
export type LineItemGroupInput = z.infer<typeof lineItemGroupSchema>;
