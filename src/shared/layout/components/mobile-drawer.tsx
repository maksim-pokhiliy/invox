"use client";

import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
} from "@mui/material";

import { UI } from "@app/shared/config/config";
import { Logo } from "@app/shared/ui/logo";

import type { ThemeMode } from "@app/providers/theme/registry";

import { DrawerFooter } from "./drawer-footer";
import { DrawerNavList } from "./drawer-nav-list";

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  pathname: string;
  mode: ThemeMode;
  onToggleTheme: () => void;
  onNavigate: (href: string) => void;
  onSettings: () => void;
  onSignOut: () => void;
}

export function MobileDrawer({
  open,
  onClose,
  pathname,
  mode,
  onToggleTheme,
  onNavigate,
  onSettings,
  onSignOut,
}: MobileDrawerProps) {
  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: UI.DRAWER_WIDTH, bgcolor: "background.paper" } } }}
    >
      <Stack direction="row" sx={{ p: 2, alignItems: "center", justifyContent: "space-between" }}>
        <Logo size="medium" />
        <IconButton onClick={onClose} aria-label="Close navigation menu">
          <CloseIcon />
        </IconButton>
      </Stack>
      <Divider />
      <DrawerNavList pathname={pathname} onNavigate={onNavigate} />
      <Divider sx={{ my: 1 }} />
      <List sx={{ px: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => onNavigate("/app/invoices/new")}
            sx={{ borderRadius: 2, mb: 0.5 }}
          >
            <ListItemIcon sx={{ color: "primary.main" }}>
              <AddIcon />
            </ListItemIcon>
            <ListItemText primary="New Invoice" slotProps={{ primary: { fontWeight: 500 } }} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={onSettings} sx={{ borderRadius: 2, mb: 0.5 }}>
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </ListItem>
      </List>
      <DrawerFooter mode={mode} onToggleTheme={onToggleTheme} onSignOut={onSignOut} />
    </Drawer>
  );
}
