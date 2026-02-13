"use client";

import { Button, FormControl, InputLabel, MenuItem, Select } from "@mui/material";

import { INVOICE_STATUS_FILTER_OPTIONS } from "@app/shared/config/invoice-status";
import { FilterDrawer } from "@app/shared/ui/filter-drawer";

import { DesktopFilters } from "./desktop-filters";
import { MobileSearch } from "./mobile-search";

interface InvoicesSearchFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  filterDrawerOpen: boolean;
  setFilterDrawerOpen: (open: boolean) => void;
  invoicesCount: number;
  filteredCount: number;
  hasInvoices: boolean;
}

export function InvoicesSearchFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  filterDrawerOpen,
  setFilterDrawerOpen,
  invoicesCount,
  filteredCount,
  hasInvoices,
}: InvoicesSearchFiltersProps) {
  const hasActiveFilters = searchQuery !== "" || statusFilter !== "ALL";

  const handleClearAll = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
    setFilterDrawerOpen(false);
  };

  const handleMobileStatusChange = (value: string) => {
    setStatusFilter(value);
    setFilterDrawerOpen(false);
  };

  if (!hasInvoices) {
    return null;
  }

  return (
    <>
      <DesktopFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        hasActiveFilters={hasActiveFilters}
        filteredCount={filteredCount}
        invoicesCount={invoicesCount}
      />
      <MobileSearch
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenDrawer={() => setFilterDrawerOpen(true)}
      />
      <FilterDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        title="Filter Invoices"
      >
        <FormControl size="small" fullWidth>
          <InputLabel id="mobile-status-filter-label">Status</InputLabel>
          <Select
            labelId="mobile-status-filter-label"
            value={statusFilter}
            label="Status"
            onChange={(e) => handleMobileStatusChange(e.target.value)}
          >
            {INVOICE_STATUS_FILTER_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {hasActiveFilters && (
          <Button variant="outlined" onClick={handleClearAll}>
            Clear All Filters
          </Button>
        )}
      </FilterDrawer>
    </>
  );
}
