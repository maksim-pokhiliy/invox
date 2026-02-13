"use client";

import * as React from "react";

import CloseIcon from "@mui/icons-material/Close";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import SearchIcon from "@mui/icons-material/Search";
import {
  alpha,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";

import { SHORTCUTS, UI } from "@app/shared/config/config";

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onClose: () => void;
}

const shortcutEntries = Object.values(SHORTCUTS).map((s) => ({
  keys: [...s.keys],
  description: s.description,
  group: s.group,
}));

const GROUP_ORDER = ["General", "Navigation", "Actions"];

function useFilteredShortcuts(filter: string) {
  const filtered = React.useMemo(() => {
    if (!filter) {
      return shortcutEntries;
    }

    const lower = filter.toLowerCase();

    return shortcutEntries.filter(
      (s) =>
        s.description.toLowerCase().includes(lower) ||
        s.keys.some((k) => k.toLowerCase().includes(lower))
    );
  }, [filter]);

  const groups = React.useMemo(() => {
    const map: Record<string, typeof filtered> = {};

    for (const entry of filtered) {
      if (!map[entry.group]) {
        map[entry.group] = [];
      }

      map[entry.group].push(entry);
    }

    return map;
  }, [filtered]);

  return { filtered, groups };
}

function KeyCombo({ keys }: { keys: string[] }) {
  const theme = useTheme();

  return (
    <Stack direction="row" spacing={0.5}>
      {keys.map((key, index) => (
        <React.Fragment key={key}>
          <Stack
            component="kbd"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              px: 1,
              py: 0.5,
              minWidth: 28,
              bgcolor: alpha(theme.palette.text.primary, UI.ALPHA_HOVER),
              border: 1,
              borderColor: alpha(theme.palette.text.primary, UI.ALPHA_ACTIVE),
              borderRadius: 1,
              fontFamily: "monospace",
              fontSize: "caption.fontSize",
              fontWeight: 600,
            }}
          >
            {key}
          </Stack>
          {index < keys.length - 1 && (
            <Typography variant="body2" color="text.secondary" sx={{ mx: 0.25 }}>
              +
            </Typography>
          )}
        </React.Fragment>
      ))}
    </Stack>
  );
}

function ShortcutGroup({
  groupName,
  entries,
}: {
  groupName: string;
  entries: typeof shortcutEntries;
}) {
  const theme = useTheme();

  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        fontWeight={600}
        sx={{ textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.5, display: "block" }}
      >
        {groupName}
      </Typography>
      {entries.map((shortcut) => (
        <Stack
          key={shortcut.description}
          direction="row"
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
            p: 1.5,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, UI.ALPHA_LIGHT),
            mb: 0.5,
          }}
        >
          <Typography variant="body2">{shortcut.description}</Typography>
          <KeyCombo keys={shortcut.keys} />
        </Stack>
      ))}
    </Box>
  );
}

export function KeyboardShortcutsDialog({ open, onClose }: KeyboardShortcutsDialogProps) {
  const [filter, setFilter] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setFilter("");
    }
  }, [open]);
  const { filtered, groups } = useFilteredShortcuts(filter);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle
        component={Stack}
        direction="row"
        sx={{ alignItems: "center", justifyContent: "space-between", pb: 1 }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <KeyboardIcon fontSize="small" color="primary" />
          <Typography variant="h6" fontWeight={600}>
            Keyboard Shortcuts
          </Typography>
        </Stack>
        <IconButton size="small" onClick={onClose} aria-label="Close dialog">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          size="small"
          placeholder="Search shortcuts..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          sx={{ mb: 2 }}
          slotProps={{
            htmlInput: { "aria-label": "Search shortcuts" },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            },
          }}
        />
        <Stack direction="column" spacing={1}>
          {GROUP_ORDER.map((groupName) => {
            const entries = groups[groupName];

            if (!entries?.length) {
              return null;
            }

            return <ShortcutGroup key={groupName} groupName={groupName} entries={entries} />;
          })}
          {filtered.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
              No shortcuts match your search
            </Typography>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
