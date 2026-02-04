"use client";

import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  alpha,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardIcon from "@mui/icons-material/Keyboard";

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onClose: () => void;
}

const shortcuts = [
  { keys: ["Ctrl", "N"], description: "Create new invoice" },
  { keys: ["Ctrl", "/"], description: "Show keyboard shortcuts" },
  { keys: ["Ctrl", "Shift", "G"], description: "Go to invoices" },
  { keys: ["Ctrl", "Shift", "C"], description: "Go to clients" },
  { keys: ["Esc"], description: "Close dialog" },
];

function KeyCombo({ keys }: { keys: string[] }) {
  const theme = useTheme();
  return (
    <Box sx={{ display: "flex", gap: 0.5 }}>
      {keys.map((key, index) => (
        <React.Fragment key={key}>
          <Box
            component="kbd"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              px: 1,
              py: 0.5,
              minWidth: 28,
              bgcolor: alpha(theme.palette.text.primary, 0.06),
              border: 1,
              borderColor: alpha(theme.palette.text.primary, 0.12),
              borderRadius: 1,
              fontFamily: "monospace",
              fontSize: "0.75rem",
              fontWeight: 600,
            }}
          >
            {key}
          </Box>
          {index < keys.length - 1 && (
            <Typography variant="body2" color="text.secondary" sx={{ mx: 0.25 }}>
              +
            </Typography>
          )}
        </React.Fragment>
      ))}
    </Box>
  );
}

export function KeyboardShortcutsDialog({ open, onClose }: KeyboardShortcutsDialogProps) {
  const theme = useTheme();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle
        sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <KeyboardIcon fontSize="small" color="primary" />
          <Typography variant="h6" fontWeight={600}>
            Keyboard Shortcuts
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} aria-label="Close dialog">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, py: 1 }}>
          {shortcuts.map((shortcut) => (
            <Box
              key={shortcut.description}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 1.5,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.02),
              }}
            >
              <Typography variant="body2">{shortcut.description}</Typography>
              <KeyCombo keys={shortcut.keys} />
            </Box>
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
