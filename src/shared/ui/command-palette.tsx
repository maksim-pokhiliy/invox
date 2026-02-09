"use client";

import * as React from "react";
import {
  Dialog,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  InputAdornment,
  Divider,
  alpha,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useCommandPalette, type CommandItem } from "@app/shared/hooks/use-command-palette";
import { UI } from "@app/shared/config/config";

const GROUP_ORDER = ["Navigation", "Actions", "Recent"] as const;

function groupItems(items: CommandItem[]) {
  const groups: Record<string, CommandItem[]> = {};
  for (const item of items) {
    if (!groups[item.group]) {
      groups[item.group] = [];
    }
    groups[item.group].push(item);
  }
  return groups;
}

function ShortcutBadge({ keys }: { keys: readonly string[] }) {
  const theme = useTheme();
  return (
    <Box sx={{ display: "flex", gap: 0.5, ml: 2 }}>
      {keys.map((key) => (
        <Box
          key={key}
          component="kbd"
          sx={{
            px: 0.75,
            py: 0.25,
            bgcolor: alpha(theme.palette.text.primary, UI.ALPHA_HOVER),
            border: 1,
            borderColor: alpha(theme.palette.text.primary, UI.ALPHA_ACTIVE),
            borderRadius: 1,
            fontFamily: "monospace",
            fontSize: "0.7rem",
            fontWeight: 600,
            lineHeight: 1.5,
          }}
        >
          {key}
        </Box>
      ))}
    </Box>
  );
}

function PaletteItem({
  item,
  index,
  isSelected,
  onSelect,
}: {
  item: CommandItem;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const theme = useTheme();
  return (
    <ListItemButton
      data-index={index}
      selected={isSelected}
      onClick={onSelect}
      sx={{
        mx: 1,
        borderRadius: 1.5,
        "&.Mui-selected": { bgcolor: alpha(theme.palette.primary.main, UI.ALPHA_MEDIUM) },
      }}
    >
      {item.icon && <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>}
      <ListItemText primary={item.label} />
      {item.shortcut && <ShortcutBadge keys={item.shortcut} />}
    </ListItemButton>
  );
}

function PaletteList({
  filtered,
  selectedIndex,
  close,
}: {
  filtered: CommandItem[];
  selectedIndex: number;
  close: () => void;
}) {
  const listRef = React.useRef<HTMLUListElement>(null);
  const groups = groupItems(filtered);
  let flatIndex = 0;

  React.useEffect(() => {
    const selectedEl = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    selectedEl?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  return (
    <List ref={listRef} sx={{ maxHeight: UI.COMMAND_PALETTE_MAX_HEIGHT, overflow: "auto", py: 1 }}>
      {filtered.length === 0 && (
        <ListItem>
          <ListItemText
            primary="No results found"
            sx={{ textAlign: "center", color: "text.secondary" }}
          />
        </ListItem>
      )}
      {GROUP_ORDER.map((groupName) => {
        const groupItems = groups[groupName];
        if (!groupItems?.length) {
          return null;
        }
        return (
          <React.Fragment key={groupName}>
            <ListItem sx={{ py: 0.5 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
                sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
              >
                {groupName}
              </Typography>
            </ListItem>
            {groupItems.map((item) => {
              const currentIndex = flatIndex++;
              return (
                <PaletteItem
                  key={item.id}
                  item={item}
                  index={currentIndex}
                  isSelected={currentIndex === selectedIndex}
                  onSelect={() => {
                    item.action();
                    close();
                  }}
                />
              );
            })}
          </React.Fragment>
        );
      })}
    </List>
  );
}

export function CommandPalette() {
  const { isOpen, close, items } = useCommandPalette();
  const [query, setQuery] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  React.useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const filtered = React.useMemo(() => {
    if (!query) {
      return items;
    }
    const lower = query.toLowerCase();
    return items.filter((item) => item.label.toLowerCase().includes(lower));
  }, [items, query]);

  React.useEffect(() => {
    setSelectedIndex(0);
  }, [filtered]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      e.preventDefault();
      filtered[selectedIndex].action();
      close();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={close}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: { sx: { borderRadius: 3, overflow: "hidden", position: "fixed", top: "15%", m: 0 } },
      }}
    >
      <TextField
        autoFocus
        fullWidth
        placeholder="Type a command or search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        inputProps={{ "aria-label": "Search commands" }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
        sx={{
          "& .MuiOutlinedInput-root": { borderRadius: 0, "& fieldset": { border: "none" } },
          "& .MuiInputBase-input": { py: 2 },
        }}
      />
      <Divider />
      <PaletteList filtered={filtered} selectedIndex={selectedIndex} close={close} />
    </Dialog>
  );
}
