import { z } from "zod";

import { BRANDING, INVOICE, VALIDATION } from "@app/shared/config/config";
import {
  DISCOUNT_NONE,
  DISCOUNT_TYPE,
  type DiscountTypeValue,
} from "@app/shared/config/invoice-status";

import { lineItemGroupSchema, lineItemSchema } from "./line-item";

export const recurringItemSchema = lineItemSchema;
export const recurringItemGroupSchema = lineItemGroupSchema;

export const recurringFrequencySchema = z.enum([
  "WEEKLY",
  "BIWEEKLY",
  "MONTHLY",
  "QUARTERLY",
  "YEARLY",
]);

export const recurringStatusSchema = z.enum(["ACTIVE", "PAUSED", "CANCELED"]);

const createRecurringFields = {
  clientId: z.string().min(1),
  name: z.string().min(1),
  frequency: recurringFrequencySchema,
  currency: z.string().default(BRANDING.DEFAULT_CURRENCY),
  discount: z
    .object({
      type: z.nativeEnum(DISCOUNT_TYPE),
      value: z.number().min(0),
    })
    .optional(),
  taxRate: z.number().min(0).max(INVOICE.MAX_TAX_RATE).optional(),
  notes: z.string().optional(),
  dueDays: z.number().min(1).max(VALIDATION.MAX_DUE_DAYS).optional(),
  autoSend: z.boolean().optional(),
  items: z.array(lineItemSchema),
  itemGroups: z.array(lineItemGroupSchema).optional(),
};

const itemsRefinement = {
  check: (data: { items: unknown[]; itemGroups?: { items: unknown[] }[] }) => {
    const ungroupedCount = data.items.length;
    const groupedCount = data.itemGroups?.reduce((sum, g) => sum + g.items.length, 0) ?? 0;

    return ungroupedCount + groupedCount > 0;
  },
  config: { message: "At least one item is required", path: ["items"] },
};

export const createRecurringSchema = z
  .object({
    ...createRecurringFields,
    startDate: z.string().min(1),
    endDate: z.string().optional(),
  })
  .refine(itemsRefinement.check, itemsRefinement.config);

export const createRecurringApiSchema = z
  .object({
    ...createRecurringFields,
    startDate: z.string().transform((s) => new Date(s)),
    endDate: z
      .string()
      .transform((s) => new Date(s))
      .optional(),
  })
  .refine(itemsRefinement.check, itemsRefinement.config);

export const updateRecurringSchema = z.object({
  name: z.string().min(1).optional(),
  frequency: recurringFrequencySchema.optional(),
  status: recurringStatusSchema.optional(),
  currency: z.string().optional(),
  discount: z
    .object({
      type: z.nativeEnum(DISCOUNT_TYPE),
      value: z.number().min(0),
    })
    .nullable()
    .optional(),
  taxRate: z.number().min(0).max(INVOICE.MAX_TAX_RATE).optional(),
  notes: z.string().optional(),
  dueDays: z.number().min(1).max(VALIDATION.MAX_DUE_DAYS).optional(),
  autoSend: z.boolean().optional(),
  nextRunAt: z.string().optional(),
  endDate: z.string().nullable().optional(),
  items: z.array(lineItemSchema).optional(),
  itemGroups: z.array(lineItemGroupSchema).optional(),
});

export const updateRecurringApiSchema = updateRecurringSchema.extend({
  nextRunAt: z
    .string()
    .transform((s) => new Date(s))
    .optional(),
  endDate: z
    .string()
    .transform((s) => new Date(s))
    .nullable()
    .optional(),
});

export const recurringFormSchema = z
  .object({
    clientId: z.string().min(1, "Client is required"),
    name: z.string().min(1, "Name is required"),
    frequency: recurringFrequencySchema,
    currency: z.string(),
    discountType: z.enum([DISCOUNT_TYPE.PERCENTAGE, DISCOUNT_TYPE.FIXED, DISCOUNT_NONE]),
    discountValue: z.number().min(0),
    taxRate: z.number().min(0).max(INVOICE.MAX_TAX_RATE),
    notes: z.string().optional(),
    dueDays: z.number().min(1).max(VALIDATION.MAX_DUE_DAYS),
    autoSend: z.boolean(),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional(),
    items: z.array(lineItemSchema),
    itemGroups: z.array(lineItemGroupSchema).optional(),
  })
  .refine(itemsRefinement.check, itemsRefinement.config);

export type RecurringFrequency = z.infer<typeof recurringFrequencySchema>;
export type RecurringStatus = z.infer<typeof recurringStatusSchema>;
export type RecurringFormData = z.infer<typeof recurringFormSchema>;
export type CreateRecurringInput = z.infer<typeof createRecurringSchema>;
export type UpdateRecurringInput = z.infer<typeof updateRecurringSchema>;

export interface RecurringInvoiceItem {
  id: string;
  recurringInvoiceId: string;
  groupId: string | null;
  title: string;
  description: string | null;
  quantity: number;
  unitPrice: number;
  sortOrder: number;
}

export interface RecurringInvoiceItemGroup {
  id: string;
  recurringInvoiceId: string;
  title: string;
  sortOrder: number;
  items: RecurringInvoiceItem[];
}

export interface RecurringInvoice {
  id: string;
  name: string;
  frequency: RecurringFrequency;
  status: RecurringStatus;
  currency: string;
  discountType: DiscountTypeValue | null;
  discountValue: number;
  taxRate: number;
  notes: string | null;
  dueDays: number;
  autoSend: boolean;
  nextRunAt: string;
  lastRunAt: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  client: {
    id: string;
    name: string;
    email: string;
  };
  items: RecurringInvoiceItem[];
  itemGroups: RecurringInvoiceItemGroup[];
}
