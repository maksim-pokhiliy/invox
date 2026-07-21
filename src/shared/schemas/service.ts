import { z } from "zod";

import { asCents } from "@app/shared/types/money";

import { SCHEMA_LIMITS } from "./limits";

export const serviceFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(SCHEMA_LIMITS.SERVICE_NAME_MAX),
  description: z.string().max(SCHEMA_LIMITS.SERVICE_DESCRIPTION_MAX).optional(),
  unit: z.string().max(SCHEMA_LIMITS.SERVICE_UNIT_MAX).optional(),
  defaultPrice: z.number().min(0, "Price must be non-negative"),
  active: z.boolean().optional().default(true),
});

export const createServiceSchema = z.object({
  name: z.string().min(1, "Name is required").max(SCHEMA_LIMITS.SERVICE_NAME_MAX),
  description: z.string().max(SCHEMA_LIMITS.SERVICE_DESCRIPTION_MAX).optional(),
  unit: z.string().max(SCHEMA_LIMITS.SERVICE_UNIT_MAX).optional(),
  defaultPrice: z.number().int().min(0).max(SCHEMA_LIMITS.MONEY_MAX_CENTS).transform(asCents),
  active: z.boolean().optional().default(true),
});

export const updateServiceSchema = createServiceSchema.partial();

export type ServiceFormInput = z.input<typeof serviceFormSchema>;
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
