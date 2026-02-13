"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

import { Box, Container, type ContainerProps, Stack } from "@mui/material";

import { STORAGE_KEYS, UI } from "@app/shared/config/config";
import { useKeyboardShortcuts } from "@app/shared/hooks";
import { useCommandPalette } from "@app/shared/hooks/use-command-palette";
import { storage } from "@app/shared/lib/storage";
import { ErrorBoundary } from "@app/shared/ui/error-boundary";
import { KeyboardShortcutsDialog } from "@app/shared/ui/keyboard-shortcuts-dialog";
import { PageTransition } from "@app/shared/ui/page-transition";

import { useThemeMode } from "@app/providers/theme/registry";

import { buildShortcuts } from "./components/keyboard-shortcuts";
import { MobileDrawer } from "./components/mobile-drawer";
import { SkipLink } from "./components/skip-link";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";

interface AppLayoutProps {
  children: React.ReactNode;
  maxWidth?: ContainerProps["maxWidth"];
  disablePadding?: boolean;
}

export function AppLayout({ children, maxWidth = "lg", disablePadding = false }: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { open: openCommandPalette } = useCommandPalette();
  const { mode, toggleTheme } = useThemeMode();
  const [shortcutsDialogOpen, setShortcutsDialogOpen] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(
    () => storage.get(STORAGE_KEYS.SIDEBAR_COLLAPSED) === "true"
  );

  const handleToggleSidebar = React.useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev;

      storage.set(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(next));

      return next;
    });
  }, []);

  const shortcuts = React.useMemo(
    () => buildShortcuts(router, openCommandPalette, () => setShortcutsDialogOpen(true)),
    [router, openCommandPalette]
  );

  useKeyboardShortcuts(shortcuts);

  const handleNavigate = (href: string) => {
    setMobileMenuOpen(false);
    router.push(href);
  };

  const handleSettings = () => {
    setMobileMenuOpen(false);
    router.push("/app/settings");
  };

  const handleSignOut = async () => {
    setMobileMenuOpen(false);
    await signOut({ callbackUrl: "/auth/sign-in" });
  };

  const sidebarWidth = sidebarCollapsed ? UI.SIDEBAR_COLLAPSED_WIDTH : UI.SIDEBAR_WIDTH;

  return (
    <Stack
      direction="row"
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <SkipLink />
      <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={handleToggleSidebar} />

      <Stack
        direction="column"
        sx={{
          flex: 1,
          minWidth: 0,
          ml: { xs: 0, md: `${sidebarWidth}px` },
          minHeight: "100vh",
          transition: (t) => t.transitions.create("margin-left"),
        }}
      >
        <TopBar onMobileMenuOpen={() => setMobileMenuOpen(true)} />

        <Box
          component="main"
          id="main-content"
          tabIndex={-1}
          sx={{ flex: 1, py: disablePadding ? 0 : 4, px: 3, outline: "none", overflowX: "hidden" }}
        >
          <ErrorBoundary>
            <PageTransition>
              {maxWidth ? (
                <Container maxWidth={maxWidth} disableGutters>
                  {children}
                </Container>
              ) : (
                children
              )}
            </PageTransition>
          </ErrorBoundary>
        </Box>
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

      <KeyboardShortcutsDialog
        open={shortcutsDialogOpen}
        onClose={() => setShortcutsDialogOpen(false)}
      />
    </Stack>
  );
}
