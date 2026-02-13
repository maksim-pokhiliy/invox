"use client";

import * as React from "react";
import Link from "next/link";

import HomeIcon from "@mui/icons-material/Home";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import {
  Box,
  Breadcrumbs as MuiBreadcrumbs,
  Link as MuiLink,
  Stack,
  Typography,
} from "@mui/material";

import { UI } from "@app/shared/config/config";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
}

export function Breadcrumbs({ items, showHome = true }: BreadcrumbsProps) {
  const allItems = showHome
    ? [
        { label: "Home", href: "/app", icon: <HomeIcon sx={{ fontSize: UI.ICON_SIZE_SM }} /> },
        ...items,
      ]
    : items;

  return (
    <MuiBreadcrumbs
      separator={<NavigateNextIcon sx={{ fontSize: UI.ICON_SIZE_XS, color: "text.secondary" }} />}
      sx={{ mb: 1.5 }}
    >
      {allItems.map((item, index) => {
        const isLast = index === allItems.length - 1;

        if (isLast) {
          return (
            <Stack key={item.label} direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
              {item.icon}
              <Typography variant="body2" color="text.primary" fontWeight={500}>
                {item.label}
              </Typography>
            </Stack>
          );
        }

        return (
          <MuiLink
            key={item.label}
            component={Link}
            href={item.href || "#"}
            variant="body2"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              color: "text.secondary",
              textDecoration: "none",
              transition: (t) => t.transitions.create("color"),
              maxWidth: 200,
              "&:hover": {
                color: "primary.main",
                textDecoration: "none",
              },
            }}
          >
            {item.icon}
            <Box
              component="span"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: 160,
              }}
            >
              {item.label}
            </Box>
          </MuiLink>
        );
      })}
    </MuiBreadcrumbs>
  );
}
