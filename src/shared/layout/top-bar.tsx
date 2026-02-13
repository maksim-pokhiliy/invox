"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import { IconButton, Stack, Tooltip } from "@mui/material";

import { UI } from "@app/shared/config/config";
import { useCommandPalette } from "@app/shared/hooks/use-command-palette";

import { useThemeMode } from "@app/providers/theme/registry";

import { AccountMenu } from "./components/account-menu";

interface TopBarProps {
  onMobileMenuOpen: () => void;
}

export function TopBar({ onMobileMenuOpen }: TopBarProps) {
  const router = useRouter();
  const { mode, toggleTheme } = useThemeMode();
  const { open: openCommandPalette } = useCommandPalette();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSettings = () => {
    handleMenuClose();
    router.push("/app/settings");
  };

  const handleSignOut = async () => {
    handleMenuClose();
    await signOut({ callbackUrl: "/auth/sign-in" });
  };

  return (
    <Stack
      component="header"
      direction="row"
      sx={{
        height: UI.TOP_BAR_HEIGHT,
        alignItems: "center",
        justifyContent: "space-between",
        px: 3,
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: "transparent",
      }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <IconButton
          onClick={onMobileMenuOpen}
          sx={{ display: { xs: "flex", md: "none" }, color: "text.secondary" }}
          aria-label="Open navigation menu"
        >
          <MenuIcon />
        </IconButton>

        <Tooltip title="Search (Ctrl+K)">
          <IconButton
            size="small"
            onClick={openCommandPalette}
            sx={{ color: "text.secondary" }}
            aria-label="Open command palette"
          >
            <SearchIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
        <Tooltip title={mode === "dark" ? "Light mode" : "Dark mode"}>
          <IconButton
            size="small"
            onClick={toggleTheme}
            sx={{ display: { xs: "flex", md: "none" }, color: "text.secondary" }}
          >
            {mode === "dark" ? (
              <Brightness7Icon fontSize="small" />
            ) : (
              <Brightness4Icon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>

        <Tooltip title="Account">
          <IconButton
            size="small"
            onClick={handleMenuOpen}
            sx={{ display: { xs: "flex", md: "none" }, color: "text.secondary" }}
          >
            <AccountCircleIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <AccountMenu
          anchorEl={anchorEl}
          onClose={handleMenuClose}
          onSettings={handleSettings}
          onSignOut={handleSignOut}
        />
      </Stack>
    </Stack>
  );
}
