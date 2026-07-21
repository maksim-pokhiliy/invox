import { z } from "zod";

import { asCents } from "@app/shared/types/money";

const nullableCents = (v: number | null) => (v === null ? null : asCents(v));

export const providerCapabilitiesSchema = z.object({
  breakdownOptions: z.array(z.string()),
  allowedCombinations: z.record(z.string(), z.array(z.string())),
  roundingOptions: z.array(z.number()),
  roundingDirections: z.array(z.string()),
  hasClients: z.boolean(),
  hasTasks: z.boolean(),
  hasBillableRates: z.boolean(),
  hasCurrency: z.boolean(),
  hasProjects: z.boolean(),
});

export const providerInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  capabilities: providerCapabilitiesSchema,
});

export const providerInfoListSchema = z.array(providerInfoSchema);

export const timeTrackingConnectionSchema = z.object({
  id: z.string(),
  provider: z.string(),
  label: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  connectedAt: z.string(),
  lastUsedAt: z.string().nullable().optional(),
});

export const timeTrackingConnectionListSchema = z.array(timeTrackingConnectionSchema);

export const timeTrackingWorkspaceSchema = z.object({
  id: z.string(),
  name: z.string(),
  defaultCurrency: z.string().nullable(),
  defaultHourlyRateCents: z.number().nullable().transform(nullableCents),
  roundingDirection: z.string(),
  roundingMinutes: z.number(),
});

export const timeTrackingWorkspaceListSchema = z.array(timeTrackingWorkspaceSchema);

export const timeTrackingProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  clientId: z.string().nullable(),
  clientName: z.string().nullable(),
  active: z.boolean(),
  billable: z.boolean(),
  color: z.string().nullable(),
  currency: z.string().nullable(),
  rateCents: z.number().nullable().transform(nullableCents),
});

export const timeTrackingProjectListSchema = z.array(timeTrackingProjectSchema);

export const timeEntryItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  seconds: z.number(),
  amountCents: z.number().nullable().transform(nullableCents),
  rateCents: z.number().nullable().transform(nullableCents),
  currency: z.string().nullable(),
});

export const timeEntryGroupSchema = z.object({
  id: z.string(),
  title: z.string(),
  items: z.array(timeEntryItemSchema),
  totalSeconds: z.number(),
  totalAmountCents: z.number().nullable().transform(nullableCents),
});

export const timeEntriesResultSchema = z.object({
  groups: z.array(timeEntryGroupSchema),
  totalSeconds: z.number(),
  totalAmountCents: z.number().nullable().transform(nullableCents),
  currency: z.string().nullable(),
});

export type ProviderCapabilities = z.infer<typeof providerCapabilitiesSchema>;
export type ProviderInfo = z.infer<typeof providerInfoSchema>;
export type TimeTrackingConnection = z.infer<typeof timeTrackingConnectionSchema>;
export type TimeTrackingWorkspace = z.infer<typeof timeTrackingWorkspaceSchema>;
export type TimeTrackingProject = z.infer<typeof timeTrackingProjectSchema>;
export type TimeEntryItem = z.infer<typeof timeEntryItemSchema>;
export type TimeEntryGroup = z.infer<typeof timeEntryGroupSchema>;
export type TimeEntriesResult = z.infer<typeof timeEntriesResultSchema>;
