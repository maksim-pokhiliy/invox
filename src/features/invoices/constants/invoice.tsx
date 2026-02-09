import * as React from "react";
import CreateIcon from "@mui/icons-material/Create";
import MailIcon from "@mui/icons-material/Mail";
import VisibilityIcon from "@mui/icons-material/Visibility";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PaymentIcon from "@mui/icons-material/Payment";
import HistoryIcon from "@mui/icons-material/History";

export { STATUS_CONFIG, getStatusColor } from "@app/shared/config/invoice-status";
export { CURRENCIES } from "@app/shared/config/currencies";
export { FREQUENCIES } from "@app/shared/config/frequencies";

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
    PAID_MANUAL: {
      icon: <CheckCircleIcon fontSize="small" />,
      label: "Marked as paid",
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
