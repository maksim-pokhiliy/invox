import type { ChipProps } from "@mui/material";

import type { RecurringStatus } from "@app/shared/schemas";
import type { DataTableColumn } from "@app/shared/ui/data-table";

export const RECURRING_COLUMNS: DataTableColumn[] = [
  { id: "name", label: "Name" },
  { id: "client", label: "Client", hideOnMobile: true },
  { id: "frequency", label: "Frequency", hideOnMobile: true },
  { id: "total", label: "Amount" },
  { id: "nextRunAt", label: "Next Run", hideOnMobile: true },
  { id: "status", label: "Status" },
];

export const RECURRING_FREQUENCY_LABELS: Record<string, string> = {
  WEEKLY: "Weekly",
  BIWEEKLY: "Bi-weekly",
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  YEARLY: "Yearly",
};

export const RECURRING_STATUS_CONFIG: Record<
  RecurringStatus,
  { color: NonNullable<ChipProps["color"]>; label: string }
> = {
  ACTIVE: { color: "success", label: "Active" },
  PAUSED: { color: "warning", label: "Paused" },
  CANCELED: { color: "error", label: "Canceled" },
};
