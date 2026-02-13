import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

import AddIcon from "@mui/icons-material/Add";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DescriptionIcon from "@mui/icons-material/Description";
import PeopleIcon from "@mui/icons-material/People";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import RepeatIcon from "@mui/icons-material/Repeat";
import SettingsIcon from "@mui/icons-material/Settings";

import { SHORTCUTS } from "@app/shared/config/config";
import type { CommandItem } from "@app/shared/hooks/use-command-palette";
import type { RecentItem } from "@app/shared/hooks/use-recent-items";

export function recentToCommandItem(item: RecentItem, router: AppRouterInstance): CommandItem {
  return {
    id: `recent-${item.id}`,
    label: `${item.type}: ${item.label}`,
    group: "Recent",
    action: () => router.push(item.href),
  };
}

export function buildNavItems(router: AppRouterInstance): CommandItem[] {
  return [
    {
      id: "nav-dashboard",
      label: "Dashboard",
      icon: <DashboardIcon fontSize="small" />,
      shortcut: SHORTCUTS.GO_DASHBOARD.keys,
      group: "Navigation",
      action: () => router.push("/app"),
    },
    {
      id: "nav-invoices",
      label: "Invoices",
      icon: <ReceiptLongIcon fontSize="small" />,
      shortcut: SHORTCUTS.GO_INVOICES.keys,
      group: "Navigation",
      action: () => router.push("/app/invoices"),
    },
    {
      id: "nav-clients",
      label: "Clients",
      icon: <PeopleIcon fontSize="small" />,
      shortcut: SHORTCUTS.GO_CLIENTS.keys,
      group: "Navigation",
      action: () => router.push("/app/clients"),
    },
    {
      id: "nav-templates",
      label: "Templates",
      icon: <DescriptionIcon fontSize="small" />,
      shortcut: SHORTCUTS.GO_TEMPLATES.keys,
      group: "Navigation",
      action: () => router.push("/app/templates"),
    },
    {
      id: "nav-recurring",
      label: "Recurring",
      icon: <RepeatIcon fontSize="small" />,
      shortcut: SHORTCUTS.GO_RECURRING.keys,
      group: "Navigation",
      action: () => router.push("/app/recurring"),
    },
    {
      id: "nav-settings",
      label: "Settings",
      icon: <SettingsIcon fontSize="small" />,
      shortcut: SHORTCUTS.GO_SETTINGS.keys,
      group: "Navigation",
      action: () => router.push("/app/settings"),
    },
  ];
}

export function buildActionItems(router: AppRouterInstance): CommandItem[] {
  return [
    {
      id: "action-new-invoice",
      label: "New Invoice",
      icon: <AddIcon fontSize="small" />,
      shortcut: SHORTCUTS.NEW_INVOICE.keys,
      group: "Actions",
      action: () => router.push("/app/invoices/new"),
    },
    {
      id: "action-new-client",
      label: "New Client",
      icon: <AddIcon fontSize="small" />,
      group: "Actions",
      action: () => router.push("/app/clients"),
    },
    {
      id: "action-new-template",
      label: "New Template",
      icon: <AddIcon fontSize="small" />,
      group: "Actions",
      action: () => router.push("/app/templates/new"),
    },
    {
      id: "action-new-recurring",
      label: "New Recurring Invoice",
      icon: <AddIcon fontSize="small" />,
      group: "Actions",
      action: () => router.push("/app/recurring/new"),
    },
  ];
}
