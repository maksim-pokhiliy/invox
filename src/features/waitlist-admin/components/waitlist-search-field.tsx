"use client";

import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import { Box, IconButton, InputAdornment, TextField, Typography } from "@mui/material";

interface WaitlistSearchFieldProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filteredCount: number;
  totalCount: number;
}

export function WaitlistSearchField({
  searchQuery,
  onSearchChange,
  filteredCount,
  totalCount,
}: WaitlistSearchFieldProps) {
  return (
    <Box sx={{ mb: 3 }}>
      <TextField
        placeholder="Search by email..."
        size="small"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ minWidth: { sm: 280 } }}
        slotProps={{
          htmlInput: { "aria-label": "Search waitlist entries" },
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
          {filteredCount} of {totalCount} entries
        </Typography>
      )}
    </Box>
  );
}
