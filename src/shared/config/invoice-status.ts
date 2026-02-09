import type { Theme } from "@mui/material";

export const INVOICE_STATUS = {
  DRAFT: "DRAFT",
  SENT: "SENT",
  VIEWED: "VIEWED",
  PAID: "PAID",
  PARTIALLY_PAID: "PARTIALLY_PAID",
  OVERDUE: "OVERDUE",
} as const;

export type InvoiceStatusValue = (typeof INVOICE_STATUS)[keyof typeof INVOICE_STATUS];

export const DISCOUNT_TYPE = {
  PERCENTAGE: "PERCENTAGE",
  FIXED: "FIXED",
} as const;

export type DiscountTypeValue = (typeof DISCOUNT_TYPE)[keyof typeof DISCOUNT_TYPE];

export const INVOICE_EVENT = {
  CREATED: "CREATED",
  SENT: "SENT",
  VIEWED: "VIEWED",
  PAID_MANUAL: "PAID_MANUAL",
  PAID_BANK: "PAID_BANK",
  PAYMENT_RECORDED: "PAYMENT_RECORDED",
  PAYMENT_DELETED: "PAYMENT_DELETED",
  REMINDER_SENT: "REMINDER_SENT",
} as const;

export const FOLLOWUP_STATUS = {
  PENDING: "PENDING",
  CANCELED: "CANCELED",
} as const;

export const STATUS_CONFIG: Record<
  string,
  { color: "success" | "error" | "info" | "warning" | "default"; label: string }
> = {
  PAID: { color: "success", label: "Paid" },
  PARTIALLY_PAID: { color: "warning", label: "Partially Paid" },
  OVERDUE: { color: "error", label: "Overdue" },
  SENT: { color: "info", label: "Sent" },
  VIEWED: { color: "info", label: "Viewed" },
  DRAFT: { color: "default", label: "Draft" },
};

export function getStatusColor(theme: Theme, status: string): string {
  const config = STATUS_CONFIG[status];
  if (!config || config.color === "default") {
    return theme.palette.text.secondary;
  }
  return theme.palette[config.color].main;
}
