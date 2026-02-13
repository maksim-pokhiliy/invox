"use client";

import Link from "next/link";

import { alpha, Box, Button, useTheme } from "@mui/material";

import { RESPONSIVE_SX, UI } from "@app/shared/config/config";

import { isNavActive, NAV_ITEMS } from "./nav-config";

interface DesktopNavProps {
  pathname: string;
}

export function DesktopNav({ pathname }: DesktopNavProps) {
  const theme = useTheme();

  return (
    <Box sx={{ ...RESPONSIVE_SX.DESKTOP_MD_ONLY, gap: 0.5, flex: 1 }}>
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
