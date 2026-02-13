interface ProviderMeta {
  name: string;
  description: string;
  docsUrl: string;
}

export const PROVIDER_META: Record<string, ProviderMeta> = {
  toggl: {
    name: "Toggl Track",
    description: "Import time entries from Toggl Track to create invoice line items",
    docsUrl: "https://track.toggl.com/profile",
  },
};

export const BREAKDOWN_LABELS: Record<string, string> = {
  projects: "Project",
  clients: "Client",
  tasks: "Task",
  descriptions: "Description",
};

export const ROUNDING_LABELS: Record<number, string> = {
  0: "No rounding",
  1: "1 min",
  5: "5 min",
  6: "6 min (1/10 hr)",
  10: "10 min",
  12: "12 min (1/5 hr)",
  15: "15 min (1/4 hr)",
  30: "30 min (1/2 hr)",
  60: "60 min (1 hr)",
};

export const RATE_SOURCE = {
  PROVIDER: "provider",
  GETPAID: "getpaid",
  CUSTOM: "custom",
} as const;

export type RateSource = (typeof RATE_SOURCE)[keyof typeof RATE_SOURCE];
