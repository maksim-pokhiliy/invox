import type { DataTableColumn } from "@app/shared/ui/data-table";

export const TEMPLATE_COLUMNS: DataTableColumn[] = [
  { id: "name", label: "Name" },
  { id: "items", label: "Items", hideOnMobile: true },
  { id: "total", label: "Est. Total" },
  { id: "dueDays", label: "Due Days", sortable: false, hideOnMobile: true },
  { id: "updatedAt", label: "Updated", hideOnMobile: true },
];
