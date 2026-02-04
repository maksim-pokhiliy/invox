"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
  useTheme,
  alpha,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import AddIcon from "@mui/icons-material/Add";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { Logo } from "@app/components/brand/Logo";
import { useThemeMode } from "@app/components/theme/ThemeRegistry";
import { usePrefetchInvoices, usePrefetchClients } from "@app/lib/api";

const navItems = [
  { label: "Invoices", href: "/app/invoices", icon: <ReceiptLongIcon fontSize="small" /> },
  { label: "Clients", href: "/app/clients", icon: <PeopleIcon fontSize="small" /> },
];

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const { mode, toggleTheme } = useThemeMode();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const prefetchInvoices = usePrefetchInvoices();
  const prefetchClients = usePrefetchClients();

  const handlePrefetch = (href: string) => {
    if (href === "/app/invoices") {
      prefetchInvoices();
    } else if (href === "/app/clients") {
      prefetchClients();
    }
  };

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
          bgcolor: alpha(theme.palette.background.paper, 0.85),
          backdropFilter: "blur(12px)",
          borderRadius: 3,
          border: 1,
          borderColor: "divider",
          px: 3,
          height: 80,
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Mobile Menu Button */}
        <IconButton
          onClick={() => setMobileMenuOpen(true)}
          sx={{
            display: { xs: "flex", md: "none" },
            mr: 1,
            color: "text.secondary",
          }}
          aria-label="Open navigation menu"
        >
          <MenuIcon />
        </IconButton>

        {/* Logo */}
        <Box
          component={Link}
          href="/app"
          sx={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
            mr: 4,
          }}
        >
          <Logo size="medium" />
        </Box>

        {/* Navigation - Hidden on mobile */}
        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 0.5, flex: 1 }}>
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Button
                key={item.href}
                component={Link}
                href={item.href}
                size="small"
                startIcon={item.icon}
                onMouseEnter={() => handlePrefetch(item.href)}
                sx={{
                  color: isActive ? "primary.main" : "text.secondary",
                  bgcolor: isActive ? alpha(theme.palette.primary.main, 0.08) : "transparent",
                  fontWeight: isActive ? 600 : 500,
                  px: 1.5,
                  borderRadius: 2,
                  "&:hover": {
                    bgcolor: isActive
                      ? alpha(theme.palette.primary.main, 0.12)
                      : alpha(theme.palette.text.primary, 0.04),
                  },
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Box>

        {/* Spacer for mobile */}
        <Box sx={{ flex: 1, display: { xs: "block", md: "none" } }} />

        {/* Actions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* New Invoice Button */}
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon fontSize="small" />}
            onClick={() => router.push("/app/invoices/new")}
            sx={{
              mr: 1,
              display: { xs: "none", sm: "flex" },
            }}
          >
            New Invoice
          </Button>

          {/* Theme Toggle */}
          <Tooltip title={mode === "dark" ? "Light mode" : "Dark mode"}>
            <IconButton size="small" onClick={toggleTheme} sx={{ color: "text.secondary" }}>
              {mode === "dark" ? (
                <Brightness7Icon fontSize="small" />
              ) : (
                <Brightness4Icon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>

          {/* User Menu */}
          <Tooltip title="Account">
            <IconButton size="small" onClick={handleMenuOpen} sx={{ color: "text.secondary" }}>
              <AccountCircleIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            slotProps={{
              paper: {
                sx: {
                  minWidth: 180,
                  mt: 1,
                  borderRadius: 2,
                },
              },
            }}
          >
            <MenuItem onClick={handleSettings}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Settings</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleSignOut}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Sign Out</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            bgcolor: "background.paper",
          },
        }}
      >
        <Box sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Logo size="medium" />
          <IconButton onClick={() => setMobileMenuOpen(false)} aria-label="Close navigation menu">
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <List sx={{ px: 1 }}>
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <ListItem key={item.href} disablePadding>
                <ListItemButton
                  onClick={() => handleNavigate(item.href)}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    bgcolor: isActive ? alpha(theme.palette.primary.main, 0.08) : "transparent",
                  }}
                >
                  <ListItemIcon sx={{ color: isActive ? "primary.main" : "text.secondary" }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? "primary.main" : "text.primary",
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
        <Divider sx={{ my: 1 }} />
        <List sx={{ px: 1 }}>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleNavigate("/app/invoices/new")}
              sx={{ borderRadius: 2, mb: 0.5 }}
            >
              <ListItemIcon sx={{ color: "primary.main" }}>
                <AddIcon />
              </ListItemIcon>
              <ListItemText primary="New Invoice" primaryTypographyProps={{ fontWeight: 500 }} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={handleSettings} sx={{ borderRadius: 2, mb: 0.5 }}>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItemButton>
          </ListItem>
        </List>
        <Box sx={{ mt: "auto", p: 2 }}>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography variant="body2" color="text.secondary">
              {mode === "dark" ? "Dark Mode" : "Light Mode"}
            </Typography>
            <IconButton onClick={toggleTheme} size="small">
              {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Box>
          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleSignOut}
            sx={{ mt: 2 }}
          >
            Sign Out
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
}
