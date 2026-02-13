"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

import MenuIcon from "@mui/icons-material/Menu";
import { alpha, Box, IconButton, Stack, useTheme } from "@mui/material";

import { UI } from "@app/shared/config/config";
import { Logo } from "@app/shared/ui/logo";

import { useThemeMode } from "@app/providers/theme/registry";

import { AccountMenu } from "./components/account-menu";
import { DesktopNav } from "./components/desktop-nav";
import { HeaderActions } from "./components/header-actions";
import { MobileDrawer } from "./components/mobile-drawer";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const { mode, toggleTheme } = useThemeMode();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    handleMenuClose();
    setMobileMenuOpen(false);
    await signOut({ callbackUrl: "/auth/sign-in" });
  };

  const handleSettings = () => {
    handleMenuClose();
    setMobileMenuOpen(false);
    router.push("/app/settings");
  };

  const handleNavigate = (href: string) => {
    setMobileMenuOpen(false);
    router.push(href);
  };

  return (
    <Box
      component="header"
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: theme.zIndex.appBar,
        pt: 2,
        px: 3,
        pb: 2,
      }}
    >
      <Stack
        direction="row"
        sx={{
          maxWidth: "lg",
          mx: "auto",
          bgcolor: alpha(theme.palette.background.paper, UI.HEADER_BG_ALPHA),
          backdropFilter: `blur(${UI.HEADER_BACKDROP_BLUR}px)`,
          borderRadius: 3,
          border: 1,
          borderColor: "divider",
          px: 3,
          height: UI.HEADER_HEIGHT,
          alignItems: "center",
        }}
      >
        <IconButton
          onClick={() => setMobileMenuOpen(true)}
          sx={{ display: { xs: "flex", md: "none" }, mr: 1, color: "text.secondary" }}
          aria-label="Open navigation menu"
        >
          <MenuIcon />
        </IconButton>

        <Stack
          component={Link}
          href="/app"
          direction="row"
          sx={{ alignItems: "center", textDecoration: "none", mr: 4 }}
        >
          <Logo size="medium" />
        </Stack>

        <DesktopNav pathname={pathname} />

        <Box sx={{ flex: 1, display: { xs: "block", md: "none" } }} />

        <HeaderActions mode={mode} onToggleTheme={toggleTheme} onMenuOpen={handleMenuOpen} />

        <AccountMenu
          anchorEl={anchorEl}
          onClose={handleMenuClose}
          onSettings={handleSettings}
          onSignOut={handleSignOut}
        />
      </Stack>

      <MobileDrawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        pathname={pathname}
        mode={mode}
        onToggleTheme={toggleTheme}
        onNavigate={handleNavigate}
        onSettings={handleSettings}
        onSignOut={handleSignOut}
      />
    </Box>
  );
}
