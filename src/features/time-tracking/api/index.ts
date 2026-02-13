import { fetchApi } from "@app/shared/api/base";

export interface TimeTrackingConnection {
  id: string;
  provider: string;
  label: string | null;
  metadata: Record<string, unknown> | null;
  connectedAt: string;
  lastUsedAt: string | null;
}

export interface ProviderCapabilities {
  breakdownOptions: string[];
  allowedCombinations: Record<string, string[]>;
  roundingOptions: number[];
  roundingDirections: string[];
  hasClients: boolean;
  hasTasks: boolean;
  hasBillableRates: boolean;
  hasCurrency: boolean;
  hasProjects: boolean;
}

export interface ProviderInfo {
  id: string;
  name: string;
  capabilities: ProviderCapabilities;
}

export interface Workspace {
  id: string;
  name: string;
  defaultCurrency: string | null;
  defaultHourlyRateCents: number | null;
  roundingDirection: string;
  roundingMinutes: number;
}

export interface Project {
  id: string;
  name: string;
  clientId: string | null;
  clientName: string | null;
  active: boolean;
  billable: boolean;
  color: string | null;
  currency: string | null;
  rateCents: number | null;
}

export interface TimeEntryItem {
  id: string;
  title: string;
  seconds: number;
  amountCents: number | null;
  rateCents: number | null;
  currency: string | null;
}

export interface TimeEntryGroup {
  id: string;
  title: string;
  items: TimeEntryItem[];
  totalSeconds: number;
  totalAmountCents: number | null;
}

export interface TimeEntriesResult {
  groups: TimeEntryGroup[];
  totalSeconds: number;
  totalAmountCents: number | null;
  currency: string | null;
}

export interface TimeEntriesSearchInput {
  provider: string;
  workspaceId: string;
  startDate: string;
  endDate: string;
  projectIds?: string[];
  grouping: string;
  subGrouping: string;
  roundingMinutes?: number;
  billableOnly?: boolean;
}

export interface Selection {
  [groupId: string]: Set<string>;
}

export interface ImportedItem {
  title: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface ImportedGroup {
  title: string;
  items: ImportedItem[];
}

export const timeTrackingApi = {
  getProviders: () => fetchApi<ProviderInfo[]>("/api/time-tracking/providers"),

  getConnections: () => fetchApi<TimeTrackingConnection[]>("/api/time-tracking/connections"),

  connect: (provider: string, token: string) =>
    fetchApi<TimeTrackingConnection>("/api/time-tracking/connections", {
      method: "POST",
      body: JSON.stringify({ provider, token }),
    }),

  disconnect: (connectionId: string) =>
    fetchApi<{ success: boolean }>(`/api/time-tracking/connections/${connectionId}`, {
      method: "DELETE",
    }),

  getWorkspaces: (provider: string) =>
    fetchApi<Workspace[]>(`/api/time-tracking/workspaces?provider=${provider}`),

  getProjects: (provider: string, workspaceId: string) =>
    fetchApi<Project[]>(
      `/api/time-tracking/projects?provider=${provider}&workspaceId=${workspaceId}`
    ),

  searchTimeEntries: (input: TimeEntriesSearchInput) =>
    fetchApi<TimeEntriesResult>("/api/time-tracking/time-entries", {
      method: "POST",
      body: JSON.stringify(input),
    }),
};
