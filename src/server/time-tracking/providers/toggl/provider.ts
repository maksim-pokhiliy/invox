import { CURRENCY, TIME_TRACKING } from "@app/shared/config/config";

import type {
  NormalizedClient,
  NormalizedProject,
  NormalizedWorkspace,
  ProviderCapabilities,
  RoundingDirection,
  TimeEntriesQuery,
  TimeEntriesResult,
  TimeEntryGroup,
  TimeEntryItem,
  TimeTrackingProvider,
} from "../types";
import {
  fetchClients,
  fetchMe,
  fetchProjects,
  fetchSummaryReport,
  fetchTasks,
  fetchWorkspaces,
  type TogglSummaryGroup,
} from "./client";

const ROUNDING_DIRECTION_MAP: Record<number, RoundingDirection> = {
  0: "nearest",
  1: "up",
  [-1]: "down",
};

const capabilities: ProviderCapabilities = {
  breakdownOptions: ["projects", "clients", "tasks", "descriptions"],
  allowedCombinations: {
    projects: ["tasks", "descriptions"],
    clients: ["tasks", "projects", "descriptions"],
    none: ["projects", "tasks", "descriptions"],
  },
  roundingOptions: TIME_TRACKING.ROUNDING_OPTIONS,
  roundingDirections: ["nearest", "up", "down"],
  hasClients: true,
  hasTasks: true,
  hasBillableRates: true,
  hasCurrency: true,
  hasProjects: true,
};

type NameMap = Map<string, string>;

async function buildGroupNameMap(
  token: string,
  workspaceId: string,
  grouping: string
): Promise<NameMap> {
  const map: NameMap = new Map();

  if (grouping === "projects") {
    const projects = await fetchProjects(token, workspaceId);

    projects.forEach((p) => map.set(String(p.id), p.name));
  } else if (grouping === "clients") {
    const clients = await fetchClients(token, workspaceId);

    clients.forEach((c) => map.set(String(c.id), c.name));
  }

  return map;
}

async function buildSubGroupNameMap(
  token: string,
  workspaceId: string,
  subGrouping: string,
  groups: TogglSummaryGroup[]
): Promise<NameMap> {
  const map: NameMap = new Map();

  if (subGrouping === "tasks") {
    const projectIds = groups.map((g) => g.id).filter((id): id is number => id !== null);
    const taskResults = await Promise.all(
      projectIds.map((pid) => fetchTasks(token, workspaceId, pid).catch(() => []))
    );

    taskResults.flat().forEach((t) => map.set(String(t.id), t.name));
  } else if (subGrouping === "projects") {
    const projects = await fetchProjects(token, workspaceId);

    projects.forEach((p) => map.set(String(p.id), p.name));
  } else if (subGrouping === "clients") {
    const clients = await fetchClients(token, workspaceId);

    clients.forEach((c) => map.set(String(c.id), c.name));
  }

  return map;
}

function mapGroup(
  group: TogglSummaryGroup,
  groupNames: NameMap,
  subGroupNames: NameMap
): TimeEntryGroup {
  const groupId = group.id !== null ? String(group.id) : "ungrouped";
  const groupTitle = (group.id !== null ? groupNames.get(String(group.id)) : null) ?? "Ungrouped";

  let groupSeconds = 0;
  let groupAmountCents: number | null = null;

  const items: TimeEntryItem[] = group.sub_groups.map((sub) => {
    groupSeconds += sub.seconds;

    let itemAmountCents: number | null = null;
    let itemRateCents: number | null = null;
    let itemCurrency: string | null = null;

    if (sub.rates.length > 0) {
      const rate = sub.rates[0];

      itemRateCents = rate.hourly_rate_in_cents;
      itemCurrency = rate.currency;
      const roundedHours = Math.round((sub.seconds / TIME_TRACKING.SECONDS_PER_HOUR) * 100) / 100;

      itemAmountCents = Math.round(roundedHours * rate.hourly_rate_in_cents);

      if (groupAmountCents === null) {
        groupAmountCents = 0;
      }

      groupAmountCents += itemAmountCents;
    }

    const subId = sub.id !== null ? String(sub.id) : `sub-${groupId}-${sub.seconds}`;
    const subTitle = (sub.id !== null ? subGroupNames.get(String(sub.id)) : null) ?? "Time entry";

    return {
      id: subId,
      title: subTitle,
      seconds: sub.seconds,
      amountCents: itemAmountCents,
      rateCents: itemRateCents,
      currency: itemCurrency,
    };
  });

  return {
    id: groupId,
    title: groupTitle,
    items,
    totalSeconds: groupSeconds,
    totalAmountCents: groupAmountCents,
  };
}

export const togglProvider: TimeTrackingProvider = {
  id: "toggl",
  name: "Toggl Track",
  capabilities,

  async validateToken(token: string) {
    try {
      const user = await fetchMe(token);

      return {
        valid: true,
        user: {
          id: String(user.id),
          email: user.email,
          name: user.fullname,
          defaultWorkspaceId: String(user.default_workspace_id),
        },
      };
    } catch {
      return { valid: false };
    }
  },

  async getWorkspaces(token: string): Promise<NormalizedWorkspace[]> {
    const workspaces = await fetchWorkspaces(token);

    return workspaces.map((ws) => ({
      id: String(ws.id),
      name: ws.name,
      defaultCurrency: ws.default_currency || null,
      defaultHourlyRateCents: ws.default_hourly_rate
        ? Math.round(ws.default_hourly_rate * CURRENCY.CENTS_MULTIPLIER)
        : null,
      roundingDirection: ROUNDING_DIRECTION_MAP[ws.rounding] ?? "nearest",
      roundingMinutes: ws.rounding_minutes,
    }));
  },

  async getProjects(token: string, workspaceId: string): Promise<NormalizedProject[]> {
    const [projects, clients] = await Promise.all([
      fetchProjects(token, workspaceId),
      fetchClients(token, workspaceId),
    ]);

    const clientMap = new Map(clients.map((c) => [c.id, c.name]));

    return projects.map((p) => ({
      id: String(p.id),
      name: p.name,
      clientId: p.client_id ? String(p.client_id) : null,
      clientName: p.client_id ? (clientMap.get(p.client_id) ?? null) : null,
      active: p.active,
      billable: p.billable,
      color: p.color || null,
      currency: p.currency || null,
      rateCents: p.rate ? Math.round(p.rate * CURRENCY.CENTS_MULTIPLIER) : null,
    }));
  },

  async getClients(token: string, workspaceId: string): Promise<NormalizedClient[]> {
    const clients = await fetchClients(token, workspaceId);

    return clients
      .filter((c) => !c.archived)
      .map((c) => ({
        id: String(c.id),
        name: c.name,
      }));
  },

  async getTimeEntries(token: string, query: TimeEntriesQuery): Promise<TimeEntriesResult> {
    const response = await fetchSummaryReport(token, {
      workspaceId: query.workspaceId,
      startDate: query.startDate,
      endDate: query.endDate,
      projectIds: query.projectIds,
      grouping: query.grouping,
      subGrouping: query.subGrouping,
      roundingMinutes: query.roundingMinutes,
      billableOnly: query.billableOnly,
    });

    const [groupNames, subGroupNames] = await Promise.all([
      buildGroupNameMap(token, query.workspaceId, query.grouping),
      buildSubGroupNameMap(token, query.workspaceId, query.subGrouping, response.groups),
    ]);

    let totalSeconds = 0;
    let totalAmountCents: number | null = null;
    let detectedCurrency: string | null = null;

    const groups: TimeEntryGroup[] = response.groups.map((group) => {
      const mapped = mapGroup(group, groupNames, subGroupNames);

      totalSeconds += mapped.totalSeconds;

      if (mapped.totalAmountCents !== null) {
        if (totalAmountCents === null) {
          totalAmountCents = 0;
        }

        totalAmountCents += mapped.totalAmountCents;
      }

      if (!detectedCurrency) {
        const firstRate = group.sub_groups.find((s) => s.rates.length > 0)?.rates[0];

        if (firstRate) {
          detectedCurrency = firstRate.currency;
        }
      }

      return mapped;
    });

    return {
      groups,
      totalSeconds,
      totalAmountCents,
      currency: detectedCurrency,
    };
  },
};
