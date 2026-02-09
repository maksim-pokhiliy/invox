"use client";

import Link from "next/link";
import { Box, Button, alpha, useTheme } from "@mui/material";
import { UI } from "@app/shared/config/config";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PeopleIcon from "@mui/icons-material/People";
import DescriptionIcon from "@mui/icons-material/Description";
import RepeatIcon from "@mui/icons-material/Repeat";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/app", icon: <DashboardIcon fontSize="small" />, exact: true },
  { label: "Invoices", href: "/app/invoices", icon: <ReceiptLongIcon fontSize="small" /> },
  { label: "Recurring", href: "/app/recurring", icon: <RepeatIcon fontSize="small" /> },
  { label: "Clients", href: "/app/clients", icon: <PeopleIcon fontSize="small" /> },
  { label: "Templates", href: "/app/templates", icon: <DescriptionIcon fontSize="small" /> },
];

function isNavActive(pathname: string, item: NavItem) {
  if (item.exact) {
    return pathname === item.href;
  }
  return pathname.startsWith(item.href);
}

interface DesktopNavProps {
  pathname: string;
}

export function DesktopNav({ pathname }: DesktopNavProps) {
  const theme = useTheme();

  return (
    <Box sx={{ display: { xs: "none", md: "flex" }, gap: 0.5, flex: 1 }}>
      {NAV_ITEMS.map((item) => {
        const isActive = isNavActive(pathname, item);
        return (
          <Button
            key={item.href}
            component={Link}
            href={item.href}
            size="small"
            startIcon={item.icon}
            sx={{
              color: isActive ? "primary.main" : "text.secondary",
              bgcolor: isActive
                ? alpha(theme.palette.primary.main, UI.ALPHA_MEDIUM)
                : "transparent",
              fontWeight: isActive ? 600 : 500,
              px: 1.5,
              borderRadius: 2,
              "&:hover": {
                bgcolor: isActive
                  ? alpha(theme.palette.primary.main, UI.ALPHA_ACTIVE)
                  : alpha(theme.palette.text.primary, UI.ALPHA_HOVER),
              },
            }}
          >
            {item.label}
          </Button>
        );
      })}
    </Box>
  );
}

export { NAV_ITEMS, isNavActive };
export type { NavItem };
