"use client";

import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import { Box, IconButton, InputAdornment, TextField, Typography } from "@mui/material";

interface ServicesSearchFieldProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filteredCount: number;
  totalCount: number;
}

export function ServicesSearchField({
  searchQuery,
  onSearchChange,
  filteredCount,
  totalCount,
}: ServicesSearchFieldProps) {
  return (
    <Box sx={{ mb: 3 }}>
      <TextField
        placeholder="Search services..."
        size="small"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ minWidth: { sm: 280 } }}
        slotProps={{
          htmlInput: { "aria-label": "Search services" },
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => onSearchChange("")}
                  aria-label="Clear search"
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
      {searchQuery && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {filteredCount} of {totalCount} services
        </Typography>
      )}
    </Box>
  );
}
