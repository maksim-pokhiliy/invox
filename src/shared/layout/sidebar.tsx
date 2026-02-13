"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import AddIcon from "@mui/icons-material/Add";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  alpha,
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Tooltip,
  useTheme,
} from "@mui/material";

import { RESPONSIVE_SX, UI } from "@app/shared/config/config";
import { Logo } from "@app/shared/ui/logo";

import { SidebarNav } from "./components/sidebar-nav";
import { SidebarUserProfile } from "./components/sidebar-user-profile";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const theme = useTheme();
  const sidebarWidth = collapsed ? UI.SIDEBAR_COLLAPSED_WIDTH : UI.SIDEBAR_WIDTH;

  return (
    <Box
      component="nav"
      sx={{
        ...RESPONSIVE_SX.DESKTOP_MD_ONLY,
        flexDirection: "column",
        width: sidebarWidth,
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        bgcolor: "background.paper",
        borderRight: 1,
        borderColor: "divider",
        zIndex: theme.zIndex.drawer,
        transition: theme.transitions.create("width"),
        overflow: "hidden",
      }}
    >
      <Stack
        direction={collapsed ? "column" : "row"}
        spacing={0.5}
        sx={{
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          px: collapsed ? 1 : 2.5,
          py: collapsed ? 1 : 2.5,
          minHeight: UI.TOP_BAR_HEIGHT,
        }}
      >
        <Box component={Link} href="/app" sx={{ textDecoration: "none" }}>
          <Logo size={collapsed ? "small" : "medium"} showText={!collapsed} />
        </Box>
        <Tooltip title={collapsed ? "Expand sidebar" : "Collapse sidebar"} placement="right" arrow>
          <IconButton
            size="small"
            onClick={onToggleCollapse}
            sx={{ color: "text.secondary" }}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRightIcon fontSize="small" />
            ) : (
              <ChevronLeftIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      </Stack>

      <Box sx={{ px: collapsed ? 0.75 : 2, mb: 2 }}>
        {collapsed ? (
          <Tooltip title="New Invoice" placement="right" arrow>
            <IconButton
              component={Link}
              href="/app/invoices/new"
              sx={{
                width: "100%",
                borderRadius: 2,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                "&:hover": { bgcolor: "primary.dark" },
              }}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Button
            variant="contained"
            fullWidth
            startIcon={<AddIcon />}
            component={Link}
            href="/app/invoices/new"
            sx={{ py: 1.25 }}
          >
            New Invoice
          </Button>
        )}
      </Box>

      <SidebarNav pathname={pathname} collapsed={collapsed} />

      {collapsed ? (
        <Box sx={{ px: 0.75, mb: 1 }}>
          <Tooltip title="Settings" placement="right" arrow>
            <ListItemButton
              component={Link}
              href="/app/settings"
              sx={{
                borderRadius: 2,
                justifyContent: "center",
                px: 1.5,
                minHeight: UI.NAV_PILL_HEIGHT,
                bgcolor: pathname.startsWith("/app/settings")
                  ? alpha(theme.palette.primary.main, UI.ALPHA_MEDIUM)
                  : "transparent",
              }}
            >
              <SettingsIcon fontSize="small" sx={{ color: "text.secondary" }} />
            </ListItemButton>
          </Tooltip>
        </Box>
      ) : (
        <List sx={{ px: 1, py: 0 }}>
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              href="/app/settings"
              sx={{
                borderRadius: 2,
                mb: 0.5,
                bgcolor: pathname.startsWith("/app/settings")
                  ? alpha(theme.palette.primary.main, UI.ALPHA_MEDIUM)
                  : "transparent",
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: "text.secondary" }}>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Settings"
                slotProps={{ primary: { fontSize: UI.FONT_SIZE_NAV } }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      )}

      <SidebarUserProfile collapsed={collapsed} />
    </Box>
  );
}
