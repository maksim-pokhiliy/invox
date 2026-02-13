"use client";

import Link from "next/link";

import {
  alpha,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  useTheme,
} from "@mui/material";

import { UI } from "@app/shared/config/config";

import { isNavActive, NAV_ITEMS } from "./nav-config";

interface SidebarNavProps {
  pathname: string;
  collapsed: boolean;
}

export function SidebarNav({ pathname, collapsed }: SidebarNavProps) {
  const theme = useTheme();
  const activeIndex = NAV_ITEMS.findIndex((item) => isNavActive(pathname, item));

  return (
    <List sx={{ px: collapsed ? 0.75 : 1, flex: 1, position: "relative" }}>
      {NAV_ITEMS.map((item, index) => {
        const isActive = index === activeIndex;
        const button = (
          <ListItem key={item.href} disablePadding>
            <ListItemButton
              component={Link}
              href={item.href}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                minHeight: UI.NAV_PILL_HEIGHT,
                justifyContent: collapsed ? "center" : "flex-start",
                px: collapsed ? 1.5 : 2,
                bgcolor: isActive
                  ? alpha(theme.palette.primary.main, UI.ALPHA_MEDIUM)
                  : "transparent",
                "&:hover": {
                  bgcolor: isActive
                    ? alpha(theme.palette.primary.main, UI.ALPHA_ACTIVE)
                    : alpha(theme.palette.text.primary, UI.ALPHA_HOVER),
                },
                transition: theme.transitions.create(["background-color", "padding"], {
                  duration: theme.transitions.duration.short,
                }),
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: collapsed ? 0 : 36,
                  color: isActive ? "primary.main" : "text.secondary",
                  justifyContent: "center",
                }}
              >
                {item.icon}
              </ListItemIcon>
              {!collapsed && (
                <ListItemText
                  primary={item.label}
                  slotProps={{
                    primary: {
                      fontWeight: isActive ? 600 : 500,
                      fontSize: UI.FONT_SIZE_NAV,
                      color: isActive ? "primary.main" : "text.primary",
                    },
                  }}
                />
              )}
            </ListItemButton>
          </ListItem>
        );

        if (collapsed) {
          return (
            <Tooltip key={item.href} title={item.label} placement="right" arrow>
              {button}
            </Tooltip>
          );
        }

        return button;
      })}
    </List>
  );
}
