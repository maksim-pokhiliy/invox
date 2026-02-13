"use client";

import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import { Box, IconButton, InputAdornment, TextField, Typography } from "@mui/material";

interface TemplatesSearchBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filteredCount: number;
  totalCount: number;
}

export function TemplatesSearchBar({
  searchQuery,
  setSearchQuery,
  filteredCount,
  totalCount,
}: TemplatesSearchBarProps) {
  return (
    <Box sx={{ mb: 3 }}>
      <TextField
        placeholder="Search templates..."
        size="small"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ minWidth: { sm: 280 } }}
        slotProps={{
          htmlInput: { "aria-label": "Search templates" },
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
                  onClick={() => setSearchQuery("")}
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
          {filteredCount} of {totalCount} templates
        </Typography>
      )}
    </Box>
  );
}
