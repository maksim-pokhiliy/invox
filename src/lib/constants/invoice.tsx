import * as React from "react";
import CreateIcon from "@mui/icons-material/Create";
import MailIcon from "@mui/icons-material/Mail";
import VisibilityIcon from "@mui/icons-material/Visibility";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PaymentIcon from "@mui/icons-material/Payment";
import HistoryIcon from "@mui/icons-material/History";

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

export const STATUS_COLORS: Record<string, string> = {
  PAID: "#22c55e",
  OVERDUE: "#ef4444",
  SENT: "#3b82f6",
  VIEWED: "#3b82f6",
  DRAFT: "#9ca3af",
  PARTIALLY_PAID: "#f59e0b",
};

export const EVENT_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string }> =
  {
    CREATED: {
      icon: <CreateIcon fontSize="small" />,
      label: "Invoice created",
      color: "text.secondary",
    },
    SENT: {
      icon: <MailIcon fontSize="small" />,
      label: "Invoice sent to client",
      color: "info.main",
    },
    VIEWED: {
      icon: <VisibilityIcon fontSize="small" />,
      label: "Viewed by client",
      color: "info.main",
    },
    REMINDER_SENT: {
      icon: <NotificationsIcon fontSize="small" />,
      label: "Payment reminder sent",
      color: "warning.main",
    },
    PAID_STRIPE: {
      icon: <CreditCardIcon fontSize="small" />,
      label: "Paid via Stripe",
      color: "success.main",
    },
    PAID_MANUAL: {
      icon: <CheckCircleIcon fontSize="small" />,
      label: "Marked as paid manually",
      color: "success.main",
    },
    PAYMENT_RECORDED: {
      icon: <PaymentIcon fontSize="small" />,
      label: "Payment recorded",
      color: "success.main",
    },
    STATUS_CHANGED: {
      icon: <HistoryIcon fontSize="small" />,
      label: "Status changed",
      color: "text.secondary",
    },
  };

export const CURRENCIES = [
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "CAD", label: "CAD - Canadian Dollar" },
  { value: "AUD", label: "AUD - Australian Dollar" },
  { value: "JPY", label: "JPY - Japanese Yen" },
  { value: "CHF", label: "CHF - Swiss Franc" },
];

export const FREQUENCIES = [
  { value: "WEEKLY", label: "Weekly" },
  { value: "BIWEEKLY", label: "Bi-weekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "QUARTERLY", label: "Quarterly" },
  { value: "YEARLY", label: "Yearly" },
];
