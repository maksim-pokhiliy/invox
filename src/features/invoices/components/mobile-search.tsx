"use client";

import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import { Box, IconButton, InputAdornment, TextField } from "@mui/material";

import { RESPONSIVE_SX } from "@app/shared/config/config";

interface MobileSearchProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  onOpenDrawer: () => void;
}

export function MobileSearch({ searchQuery, setSearchQuery, onOpenDrawer }: MobileSearchProps) {
  return (
    <Box sx={{ ...RESPONSIVE_SX.MOBILE_ONLY, mb: 2, gap: 1 }}>
      <TextField
        placeholder="Search invoices..."
        size="small"
        fullWidth
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        slotProps={{
          htmlInput: { "aria-label": "Search invoices" },
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          },
        }}
      />
      <IconButton onClick={onOpenDrawer} aria-label="Open filters">
        <FilterListIcon />
      </IconButton>
    </Box>
  );
}
