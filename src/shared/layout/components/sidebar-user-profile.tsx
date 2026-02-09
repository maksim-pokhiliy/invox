"use client";

import { useSession, signOut } from "next-auth/react";
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useThemeMode } from "@app/providers/theme-registry";
import { UI } from "@app/shared/config/config";

function getInitials(email: string): string {
  return email.charAt(0).toUpperCase();
}

interface SidebarUserProfileProps {
  collapsed: boolean;
}

export function SidebarUserProfile({ collapsed }: SidebarUserProfileProps) {
  const { data: session } = useSession();
  const theme = useTheme();
  const { mode, toggleTheme } = useThemeMode();
  const email = session?.user?.email || "";

  return (
    <Box sx={{ mt: "auto" }}>
      <Divider />
      <Box sx={{ p: collapsed ? 1 : 1.5 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: 1,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.text.primary, UI.ALPHA_LIGHT),
            justifyContent: collapsed ? "center" : "flex-start",
          }}
        >
          <Avatar
            sx={{
              width: UI.AVATAR_SIZE,
              height: UI.AVATAR_SIZE,
              bgcolor: "primary.main",
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            {getInitials(email)}
          </Avatar>
          {!collapsed && (
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" fontWeight={600} noWrap sx={{ lineHeight: 1.3 }}>
                {email.split("@")[0]}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
                {email}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          px: collapsed ? 0.75 : 1.5,
          pb: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          gap: 0.5,
        }}
      >
        <Tooltip title={mode === "dark" ? "Light mode" : "Dark mode"}>
          <IconButton size="small" onClick={toggleTheme} sx={{ color: "text.secondary" }}>
            {mode === "dark" ? (
              <Brightness7Icon fontSize="small" />
            ) : (
              <Brightness4Icon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>

        {!collapsed && (
          <Tooltip title="Sign out">
            <IconButton
              size="small"
              onClick={() => signOut({ callbackUrl: "/auth/sign-in" })}
              sx={{ color: "text.secondary" }}
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
}
