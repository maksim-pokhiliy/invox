"use client";

import { Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import { UI } from "@app/shared/config/config";

interface OverflowMenuItem {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  color?: string;
  show?: boolean;
}

interface OverflowMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  items: OverflowMenuItem[];
  ariaLabel?: string;
}

export function OverflowMenu({ anchorEl, onClose, items, ariaLabel }: OverflowMenuProps) {
  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      slotProps={{
        paper: {
          sx: { minWidth: UI.MENU_MIN_WIDTH, borderRadius: 2 },
        },
      }}
      aria-label={ariaLabel}
    >
      {items
        .filter((item) => item.show !== false)
        .map((item) => (
          <MenuItem
            key={item.label}
            onClick={item.onClick}
            sx={item.color ? { color: item.color } : undefined}
          >
            <ListItemIcon sx={item.color ? { color: item.color } : undefined}>
              {item.icon}
            </ListItemIcon>
            <ListItemText>{item.label}</ListItemText>
          </MenuItem>
        ))}
    </Menu>
  );
}
