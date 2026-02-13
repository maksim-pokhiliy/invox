import { TIME_TRACKING } from "@app/shared/config/config";

interface TogglUser {
  id: number;
  email: string;
  fullname: string;
  default_workspace_id: number;
}

interface TogglWorkspace {
  id: number;
  name: string;
  default_currency: string;
  default_hourly_rate: number;
  rounding: number;
  rounding_minutes: number;
}

export interface TogglProject {
  id: number;
  name: string;
  workspace_id: number;
  client_id: number | null;
  active: boolean;
  billable: boolean;
  color: string;
  currency: string | null;
  rate: number | null;
}

export interface TogglClient {
  id: number;
  name: string;
  archived: boolean;
}

export interface TogglTask {
  id: number;
  name: string;
  project_id: number;
  active: boolean;
}

interface TogglSummaryRate {
  billable_seconds: number;
  hourly_rate_in_cents: number;
  currency: string;
}

export interface TogglSummarySubGroup {
  id: number | null;
  seconds: number;
  rates: TogglSummaryRate[];
}

export interface TogglSummaryGroup {
  id: number | null;
  sub_groups: TogglSummarySubGroup[];
}

export interface TogglSummaryResponse {
  groups: TogglSummaryGroup[];
}

export interface SummaryReportParams {
  workspaceId: string;
  startDate: string;
  endDate: string;
  projectIds?: string[];
  grouping: string;
  subGrouping: string;
  roundingMinutes?: number;
  billableOnly?: boolean;
}

const PROJECTS_PER_PAGE = 200;

const GROUPING_API_MAP: Record<string, string> = {
  projects: "projects",
  clients: "clients",
  tasks: "projects",
  descriptions: "projects",
};

const SUB_GROUPING_API_MAP: Record<string, string> = {
  projects: "projects",
  clients: "clients",
  tasks: "tasks",
  descriptions: "time_entries",
};

class TogglApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "TogglApiError";
  }
}

function buildAuthHeader(token: string): string {
  return `Basic ${Buffer.from(`${token}:api_token`).toString("base64")}`;
}

async function togglFetch<T>(url: string, token: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: buildAuthHeader(token),
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const text = await response.text();

    throw new TogglApiError(response.status, `Toggl API error ${response.status}: ${text}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchMe(token: string): Promise<TogglUser> {
  return togglFetch<TogglUser>(`${TIME_TRACKING.TOGGL_API_BASE_URL}/me`, token);
}

export async function fetchWorkspaces(token: string): Promise<TogglWorkspace[]> {
  return togglFetch<TogglWorkspace[]>(`${TIME_TRACKING.TOGGL_API_BASE_URL}/workspaces`, token);
}

export async function fetchProjects(token: string, workspaceId: string): Promise<TogglProject[]> {
  const results: TogglProject[] = [];
  let page = 1;

  while (true) {
    const batch = await togglFetch<TogglProject[]>(
      `${TIME_TRACKING.TOGGL_API_BASE_URL}/workspaces/${workspaceId}/projects?active=both&per_page=${PROJECTS_PER_PAGE}&page=${page}`,
      token
    );

    results.push(...batch);

    if (batch.length < PROJECTS_PER_PAGE) {
      break;
    }

    page++;
  }

  return results;
}

export async function fetchClients(token: string, workspaceId: string): Promise<TogglClient[]> {
  return togglFetch<TogglClient[]>(
    `${TIME_TRACKING.TOGGL_API_BASE_URL}/workspaces/${workspaceId}/clients`,
    token
  );
}

export async function fetchTasks(
  token: string,
  workspaceId: string,
  projectId: number
): Promise<TogglTask[]> {
  return togglFetch<TogglTask[]>(
    `${TIME_TRACKING.TOGGL_API_BASE_URL}/workspaces/${workspaceId}/projects/${projectId}/tasks`,
    token
  );
}

export async function fetchSummaryReport(
  token: string,
  params: SummaryReportParams
): Promise<TogglSummaryResponse> {
  const body: Record<string, unknown> = {
    start_date: params.startDate,
    end_date: params.endDate,
    grouping: GROUPING_API_MAP[params.grouping] ?? "projects",
    sub_grouping: SUB_GROUPING_API_MAP[params.subGrouping] ?? "time_entries",
  };

  if (params.roundingMinutes !== undefined && params.roundingMinutes > 0) {
    body.rounding = 1;
    body.rounding_minutes = params.roundingMinutes;
  }

  if (params.projectIds?.length) {
    body.project_ids = params.projectIds.map(Number);
  }

  if (params.billableOnly) {
    body.billable = true;
  }

  return togglFetch<TogglSummaryResponse>(
    `${TIME_TRACKING.TOGGL_REPORTS_BASE_URL}/workspace/${params.workspaceId}/summary/time_entries`,
    token,
    { method: "POST", body: JSON.stringify(body) }
  );
}
