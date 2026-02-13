import { z } from "zod";

export const lineItemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  quantity: z.number().min(0.01, "Quantity is required"),
  unitPrice: z.number().min(0, "Unit price must be non-negative"),
  sortOrder: z.number().int().optional(),
});

export const lineItemGroupSchema = z.object({
  title: z.string().min(1, "Group title is required"),
  sortOrder: z.number().int().optional(),
  items: z.array(lineItemSchema),
});

export type LineItemInput = z.infer<typeof lineItemSchema>;
export type LineItemGroupInput = z.infer<typeof lineItemGroupSchema>;
