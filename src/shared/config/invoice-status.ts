import type { ChipProps, Theme } from "@mui/material";

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

export const DISCOUNT_NONE = "NONE" as const;

export type DiscountTypeValue = (typeof DISCOUNT_TYPE)[keyof typeof DISCOUNT_TYPE];

export function isDiscountType(value: string | null | undefined): value is DiscountTypeValue {
  return value === DISCOUNT_TYPE.PERCENTAGE || value === DISCOUNT_TYPE.FIXED;
}

export const INVOICE_EVENT = {
  CREATED: "CREATED",
  SENT: "SENT",
  VIEWED: "VIEWED",
  PAID_MANUAL: "PAID_MANUAL",
  PAID_BANK: "PAID_BANK",
  PAYMENT_RECORDED: "PAYMENT_RECORDED",
  PAYMENT_DELETED: "PAYMENT_DELETED",
  REMINDER_SENT: "REMINDER_SENT",
  STATUS_CHANGED: "STATUS_CHANGED",
} as const;

export type InvoiceEventValue = (typeof INVOICE_EVENT)[keyof typeof INVOICE_EVENT];

export const FOLLOWUP_STATUS = {
  PENDING: "PENDING",
  SENT: "SENT",
  CANCELED: "CANCELED",
} as const;

export const STATUS_CONFIG: Record<
  string,
  { color: NonNullable<ChipProps["color"]>; label: string }
> = {
  PAID: { color: "success", label: "Paid" },
  PARTIALLY_PAID: { color: "warning", label: "Partially Paid" },
  OVERDUE: { color: "error", label: "Overdue" },
  SENT: { color: "info", label: "Sent" },
  VIEWED: { color: "info", label: "Viewed" },
  DRAFT: { color: "default", label: "Draft" },
};

export const INVOICE_STATUS_FILTER_OPTIONS = [
  { value: "ALL", label: "All Statuses" },
  { value: INVOICE_STATUS.DRAFT, label: STATUS_CONFIG.DRAFT.label },
  { value: INVOICE_STATUS.SENT, label: STATUS_CONFIG.SENT.label },
  { value: INVOICE_STATUS.VIEWED, label: STATUS_CONFIG.VIEWED.label },
  { value: INVOICE_STATUS.PARTIALLY_PAID, label: STATUS_CONFIG.PARTIALLY_PAID.label },
  { value: INVOICE_STATUS.PAID, label: STATUS_CONFIG.PAID.label },
  { value: INVOICE_STATUS.OVERDUE, label: STATUS_CONFIG.OVERDUE.label },
];

export function getStatusColor(theme: Theme, status: string): string {
  const config = STATUS_CONFIG[status];

  if (!config || config.color === "default") {
    return theme.palette.text.secondary;
  }

  return theme.palette[config.color].main;
}
