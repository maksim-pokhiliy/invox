"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Box, Container, Link } from "@mui/material";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";
import { MobileDrawer } from "./components/mobile-drawer";
import { KeyboardShortcutsDialog } from "@app/shared/ui/keyboard-shortcuts-dialog";
import { PageTransition } from "@app/shared/ui/page-transition";
import { ErrorBoundary } from "@app/shared/ui/error-boundary";
import { useKeyboardShortcuts } from "@app/shared/hooks";
import { useCommandPalette } from "@app/shared/hooks/use-command-palette";
import { useThemeMode } from "@app/providers/theme-registry";
import { ANIMATION, UI, SHORTCUTS, STORAGE_KEYS } from "@app/shared/config/config";
import { storage } from "@app/shared/lib/storage";

interface AppLayoutProps {
  children: React.ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false;
  disablePadding?: boolean;
}

function buildShortcuts(
  router: ReturnType<typeof useRouter>,
  openCommandPalette: () => void,
  openShortcutsDialog: () => void
) {
  return [
    {
      key: SHORTCUTS.NEW_INVOICE.key,
      ctrl: true,
      handler: () => router.push("/app/invoices/new"),
      description: SHORTCUTS.NEW_INVOICE.description,
    },
    {
      key: SHORTCUTS.COMMAND_PALETTE.key,
      ctrl: true,
      handler: openCommandPalette,
      description: SHORTCUTS.COMMAND_PALETTE.description,
    },
    {
      key: SHORTCUTS.SHORTCUTS_DIALOG.key,
      handler: openShortcutsDialog,
      description: SHORTCUTS.SHORTCUTS_DIALOG.description,
    },
    {
      key: SHORTCUTS.GO_DASHBOARD.key,
      ctrl: true,
      shift: true,
      handler: () => router.push("/app"),
      description: SHORTCUTS.GO_DASHBOARD.description,
    },
    {
      key: SHORTCUTS.GO_INVOICES.key,
      ctrl: true,
      shift: true,
      handler: () => router.push("/app/invoices"),
      description: SHORTCUTS.GO_INVOICES.description,
    },
    {
      key: SHORTCUTS.GO_CLIENTS.key,
      ctrl: true,
      shift: true,
      handler: () => router.push("/app/clients"),
      description: SHORTCUTS.GO_CLIENTS.description,
    },
    {
      key: SHORTCUTS.GO_TEMPLATES.key,
      ctrl: true,
      shift: true,
      handler: () => router.push("/app/templates"),
      description: SHORTCUTS.GO_TEMPLATES.description,
    },
    {
      key: SHORTCUTS.GO_RECURRING.key,
      ctrl: true,
      shift: true,
      handler: () => router.push("/app/recurring"),
      description: SHORTCUTS.GO_RECURRING.description,
    },
    {
      key: SHORTCUTS.GO_SETTINGS.key,
      ctrl: true,
      shift: true,
      handler: () => router.push("/app/settings"),
      description: SHORTCUTS.GO_SETTINGS.description,
    },
  ];
}

function SkipLink() {
  return (
    <Link
      href="#main-content"
      sx={{
        position: "absolute",
        left: "-9999px",
        zIndex: 9999,
        padding: 2,
        bgcolor: "primary.main",
        color: "primary.contrastText",
        textDecoration: "none",
        fontWeight: 600,
        borderRadius: 1,
        "&:focus": {
          left: 16,
          top: 16,
        },
      }}
    >
      Skip to main content
    </Link>
  );
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
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <SkipLink />
      <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={handleToggleSidebar} />

      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          ml: { xs: 0, md: `${sidebarWidth}px` },
          minHeight: "100vh",
          transition: `margin-left ${ANIMATION.NORMAL}ms ease`,
        }}
      >
        <TopBar onMobileMenuOpen={() => setMobileMenuOpen(true)} />

        <Box
          component="main"
          id="main-content"
          tabIndex={-1}
          sx={{ flex: 1, py: disablePadding ? 0 : 4, px: 3, outline: "none" }}
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

      <KeyboardShortcutsDialog
        open={shortcutsDialogOpen}
        onClose={() => setShortcutsDialogOpen(false)}
      />
    </Box>
  );
}
