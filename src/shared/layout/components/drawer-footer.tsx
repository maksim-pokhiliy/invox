"use client";

import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import LogoutIcon from "@mui/icons-material/Logout";
import { Box, Button, Divider, IconButton, Stack, Typography } from "@mui/material";

import type { ThemeMode } from "@app/providers/theme/registry";

interface DrawerFooterProps {
  mode: ThemeMode;
  onToggleTheme: () => void;
  onSignOut: () => void;
}

export function DrawerFooter({ mode, onToggleTheme, onSignOut }: DrawerFooterProps) {
  return (
    <Box sx={{ mt: "auto", p: 2 }}>
      <Divider sx={{ mb: 2 }} />
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="body2" color="text.secondary">
          {mode === "dark" ? "Dark Mode" : "Light Mode"}
        </Typography>
        <IconButton onClick={onToggleTheme} size="small">
          {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Stack>
      <Button
        fullWidth
        variant="outlined"
        color="error"
        startIcon={<LogoutIcon />}
        onClick={onSignOut}
        sx={{ mt: 2 }}
      >
        Sign Out
      </Button>
    </Box>
  );
}
