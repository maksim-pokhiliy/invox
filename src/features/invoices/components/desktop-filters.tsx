"use client";

import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";

import { RESPONSIVE_SX } from "@app/shared/config/config";
import { INVOICE_STATUS_FILTER_OPTIONS } from "@app/shared/config/invoice-status";

interface DesktopFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  hasActiveFilters: boolean;
  filteredCount: number;
  invoicesCount: number;
}

export function DesktopFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  hasActiveFilters,
  filteredCount,
  invoicesCount,
}: DesktopFiltersProps) {
  return (
    <Box sx={{ ...RESPONSIVE_SX.DESKTOP_ONLY, gap: 2, mb: 3 }}>
      <TextField
        placeholder="Search invoices..."
        size="small"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ minWidth: { sm: 280 } }}
        slotProps={{
          htmlInput: { "aria-label": "Search invoices" },
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
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel id="status-filter-label">Status</InputLabel>
        <Select
          labelId="status-filter-label"
          value={statusFilter}
          label="Status"
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {INVOICE_STATUS_FILTER_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {hasActiveFilters && (
        <Typography variant="body2" color="text.secondary" sx={{ alignSelf: "center" }}>
          {filteredCount} of {invoicesCount} invoices
        </Typography>
      )}
    </Box>
  );
}
