"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Box, IconButton, alpha, useTheme } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Logo } from "@app/shared/ui/logo";
import { useThemeMode } from "@app/providers/theme-registry";
import { UI } from "@app/shared/config/config";
import { DesktopNav } from "./components/desktop-nav";
import { MobileDrawer } from "./components/mobile-drawer";
import { AccountMenu } from "./components/account-menu";
import { HeaderActions } from "./components/header-actions";

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
      <Box
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
          display: "flex",
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

        <Box
          component={Link}
          href="/app"
          sx={{ display: "flex", alignItems: "center", textDecoration: "none", mr: 4 }}
        >
          <Logo size="medium" />
        </Box>

        <DesktopNav pathname={pathname} />

        <Box sx={{ flex: 1, display: { xs: "block", md: "none" } }} />

        <HeaderActions mode={mode} onToggleTheme={toggleTheme} onMenuOpen={handleMenuOpen} />

        <AccountMenu
          anchorEl={anchorEl}
          onClose={handleMenuClose}
          onSettings={handleSettings}
          onSignOut={handleSignOut}
        />
      </Box>

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
