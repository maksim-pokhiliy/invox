import { fetchApi } from "@app/shared/api/base";
import {
  type ProviderInfo,
  providerInfoListSchema,
  successAckSchema,
  type TimeEntriesResult,
  timeEntriesResultSchema,
  type TimeTrackingConnection,
  timeTrackingConnectionListSchema,
  timeTrackingConnectionSchema,
  type TimeTrackingProject,
  timeTrackingProjectListSchema,
  type TimeTrackingWorkspace,
  timeTrackingWorkspaceListSchema,
} from "@app/shared/schemas/api";

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
  getProviders: () =>
    fetchApi<ProviderInfo[]>("/api/time-tracking/providers", undefined, providerInfoListSchema),

  getConnections: () =>
    fetchApi<TimeTrackingConnection[]>(
      "/api/time-tracking/connections",
      undefined,
      timeTrackingConnectionListSchema
    ),

  connect: (provider: string, token: string) =>
    fetchApi<TimeTrackingConnection>(
      "/api/time-tracking/connections",
      {
        method: "POST",
        body: JSON.stringify({ provider, token }),
      },
      timeTrackingConnectionSchema
    ),

  disconnect: (connectionId: string) =>
    fetchApi<{ success: boolean }>(
      `/api/time-tracking/connections/${connectionId}`,
      {
        method: "DELETE",
      },
      successAckSchema
    ),

  getWorkspaces: (provider: string) =>
    fetchApi<TimeTrackingWorkspace[]>(
      `/api/time-tracking/workspaces?provider=${provider}`,
      undefined,
      timeTrackingWorkspaceListSchema
    ),

  getProjects: (provider: string, workspaceId: string) =>
    fetchApi<TimeTrackingProject[]>(
      `/api/time-tracking/projects?provider=${provider}&workspaceId=${workspaceId}`,
      undefined,
      timeTrackingProjectListSchema
    ),

  searchTimeEntries: (input: TimeEntriesSearchInput) =>
    fetchApi<TimeEntriesResult>(
      "/api/time-tracking/time-entries",
      {
        method: "POST",
        body: JSON.stringify(input),
      },
      timeEntriesResultSchema
    ),
};
