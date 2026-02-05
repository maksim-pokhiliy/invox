import { z } from "zod";

export const templateItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
});

export const createTemplateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  currency: z.string().default("USD"),
  discount: z
    .object({
      type: z.enum(["PERCENTAGE", "FIXED"]),
      value: z.number().min(0),
    })
    .optional(),
  taxRate: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
  dueDays: z.number().min(1).max(365).optional(),
  items: z.array(templateItemSchema).min(1),
});

export const updateTemplateSchema = createTemplateSchema.partial().extend({
  discount: z
    .object({
      type: z.enum(["PERCENTAGE", "FIXED"]),
      value: z.number().min(0),
    })
    .nullable()
    .optional(),
});

export type TemplateItem = z.infer<typeof templateItemSchema>;
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;

export interface Template {
  id: string;
  name: string;
  description: string | null;
  currency: string;
  discountType: "PERCENTAGE" | "FIXED" | null;
  discountValue: number;
  taxRate: number;
  notes: string | null;
  dueDays: number;
  createdAt: string;
  updatedAt: string;
  items: {
    id: string;
    templateId: string;
    description: string;
    quantity: number;
    unitPrice: number;
  }[];
}
