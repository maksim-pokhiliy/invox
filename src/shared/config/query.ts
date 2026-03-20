import { CACHE } from "./config";

export const queryKeys = {
  clients: ["clients"] as const,
  invoices: ["invoices"] as const,
  invoice: (id: string) => ["invoice", id] as const,
  senderProfile: ["sender-profile"] as const,
  publicInvoice: (publicId: string) => ["public-invoice", publicId] as const,
  analytics: ["analytics"] as const,
  templates: ["templates"] as const,
  template: (id: string) => ["template", id] as const,
  reminderSettings: ["reminder-settings"] as const,
  recurring: ["recurring"] as const,
  recurringItem: (id: string) => ["recurring", id] as const,
  bankConnections: ["bank-connections"] as const,
  bankTransactions: ["bank-transactions"] as const,
  timeTrackingProviders: ["time-tracking-providers"] as const,
  timeTrackingConnections: ["time-tracking-connections"] as const,
  timeTrackingWorkspaces: (provider: string) => ["time-tracking-workspaces", provider] as const,
  timeTrackingProjects: (provider: string, workspaceId: string) =>
    ["time-tracking-projects", provider, workspaceId] as const,
  timeTrackingEntries: (provider: string) => ["time-tracking-entries", provider] as const,
  waitlistEntries: ["waitlist-entries"] as const,
};

export const STALE_TIME = {
  short: CACHE.STALE_SHORT,
  medium: CACHE.STALE_MEDIUM,
  long: CACHE.STALE_LONG,
} as const;
