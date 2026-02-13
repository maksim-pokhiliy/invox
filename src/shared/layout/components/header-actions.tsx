"use client";

import Link from "next/link";

import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AddIcon from "@mui/icons-material/Add";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { Button, IconButton, Stack, Tooltip } from "@mui/material";

import { RESPONSIVE_SX } from "@app/shared/config/config";

import type { ThemeMode } from "@app/providers/theme/registry";

interface HeaderActionsProps {
  mode: ThemeMode;
  onToggleTheme: () => void;
  onMenuOpen: (event: React.MouseEvent<HTMLElement>) => void;
}

export function HeaderActions({ mode, onToggleTheme, onMenuOpen }: HeaderActionsProps) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
      <Button
        variant="contained"
        size="small"
        startIcon={<AddIcon fontSize="small" />}
        component={Link}
        href="/app/invoices/new"
        sx={{ ...RESPONSIVE_SX.DESKTOP_ONLY, mr: 1 }}
      >
        New Invoice
      </Button>

      <Tooltip title={mode === "dark" ? "Light mode" : "Dark mode"}>
        <IconButton size="small" onClick={onToggleTheme} sx={{ color: "text.secondary" }}>
          {mode === "dark" ? (
            <Brightness7Icon fontSize="small" />
          ) : (
            <Brightness4Icon fontSize="small" />
          )}
        </IconButton>
      </Tooltip>

      <Tooltip title="Account">
        <IconButton size="small" onClick={onMenuOpen} sx={{ color: "text.secondary" }}>
          <AccountCircleIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}
