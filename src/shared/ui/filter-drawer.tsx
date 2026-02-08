"use client";

import { Box, Drawer, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { UI } from "@app/shared/config/config";

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function FilterDrawer({ open, onClose, title = "Filters", children }: FilterDrawerProps) {
  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            maxHeight: UI.FILTER_DRAWER_MAX_HEIGHT,
          },
        },
      }}
    >
      <Box sx={{ px: 3, pt: 2, pb: 0.5 }}>
        <Box
          sx={{
            width: UI.FILTER_DRAWER_HANDLE_WIDTH,
            height: UI.FILTER_DRAWER_HANDLE_HEIGHT,
            borderRadius: 2,
            bgcolor: "action.disabled",
            mx: "auto",
            mb: 2,
          }}
        />
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            {title}
          </Typography>
          <IconButton size="small" onClick={onClose} aria-label="Close filters">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      <Box sx={{ px: 3, pb: 3, display: "flex", flexDirection: "column", gap: 2 }}>{children}</Box>
    </Drawer>
  );
}
