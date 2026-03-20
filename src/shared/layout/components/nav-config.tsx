"use client";

import DashboardIcon from "@mui/icons-material/Dashboard";
import DescriptionIcon from "@mui/icons-material/Description";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import PeopleIcon from "@mui/icons-material/People";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import RepeatIcon from "@mui/icons-material/Repeat";

import { features } from "@app/shared/config/features";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  exact?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/app", icon: <DashboardIcon fontSize="small" />, exact: true },
  { label: "Invoices", href: "/app/invoices", icon: <ReceiptLongIcon fontSize="small" /> },
  { label: "Recurring", href: "/app/recurring", icon: <RepeatIcon fontSize="small" /> },
  { label: "Clients", href: "/app/clients", icon: <PeopleIcon fontSize="small" /> },
  { label: "Templates", href: "/app/templates", icon: <DescriptionIcon fontSize="small" /> },
  ...(features.waitlistAdmin
    ? [{ label: "Waitlist", href: "/app/waitlist", icon: <HourglassEmptyIcon fontSize="small" /> }]
    : []),
];

export function isNavActive(pathname: string, item: NavItem) {
  if (item.exact) {
    return pathname === item.href;
  }

  return pathname.startsWith(item.href);
}
