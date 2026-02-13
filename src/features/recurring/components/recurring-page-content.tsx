"use client";

import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import { Box, Button, IconButton, InputAdornment, TextField, Typography } from "@mui/material";

import { RESPONSIVE_SX } from "@app/shared/config/config";
import { ConfirmDialog } from "@app/shared/ui/confirm-dialog";
import { HelpTooltip } from "@app/shared/ui/help-tooltip";
import { MobileFab } from "@app/shared/ui/mobile-fab";
import { PageHeader } from "@app/shared/ui/page-header";

import { useRecurringPage } from "../hooks/use-recurring-page";
import { RecurringContent } from "./recurring-content";
import { RecurringOverflowMenu } from "./recurring-overflow-menu";

function RecurringSearch({
  searchQuery,
  onSearchChange,
  onClear,
  filteredCount,
  totalCount,
}: {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onClear: () => void;
  filteredCount: number;
  totalCount: number;
}) {
  return (
    <Box sx={{ mb: 3 }}>
      <TextField
        placeholder="Search recurring invoices..."
        size="small"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ minWidth: { sm: 280 } }}
        slotProps={{
          htmlInput: { "aria-label": "Search recurring invoices" },
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={onClear} aria-label="Clear search">
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
      {searchQuery && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {filteredCount} of {totalCount} recurring invoices
        </Typography>
      )}
    </Box>
  );
}

export function RecurringPageContent() {
  const state = useRecurringPage();

  const navigateToNew = () => state.router.push("/app/recurring/new");
  const showSearch = !state.isLoading && state.recurring && state.recurring.length > 0;

  return (
    <>
      <PageHeader
        title={
          <>
            Recurring Invoices
            <HelpTooltip title="Recurring invoices automatically generate new invoices on a schedule. Set the frequency, and GetPaid will create drafts for you to review and send." />
          </>
        }
        subtitle="Manage automatic invoice generation schedules"
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={navigateToNew}
            sx={RESPONSIVE_SX.DESKTOP_ONLY}
          >
            New Recurring Invoice
          </Button>
        }
      />

      {showSearch && (
        <RecurringSearch
          searchQuery={state.searchQuery}
          onSearchChange={state.setSearchQuery}
          onClear={() => state.setSearchQuery("")}
          filteredCount={state.filteredRecurring.length}
          totalCount={state.recurring?.length ?? 0}
        />
      )}

      <RecurringContent
        isLoading={state.isLoading}
        recurring={state.recurring}
        filteredRecurring={state.filteredRecurring}
        searchQuery={state.searchQuery}
        onClearSearch={() => state.setSearchQuery("")}
        onRowClick={(id: string) => state.router.push(`/app/recurring/${id}`)}
        handleMenuOpen={state.handleMenuOpen}
        calculateTotal={state.calculateTotal}
        onCreateRecurring={navigateToNew}
        page={state.page}
        rowsPerPage={state.rowsPerPage}
        onPageChange={state.handlePageChange}
        onRowsPerPageChange={state.handleRowsPerPageChange}
      />

      <RecurringOverflowMenu
        anchorEl={state.anchorEl}
        onClose={state.handleMenuClose}
        selectedItem={state.selectedItem}
        onEdit={() => {
          state.router.push(`/app/recurring/${state.selectedItem?.id}/edit`);
          state.handleMenuClose();
        }}
        onToggleStatus={state.handleToggleStatus}
        onGenerateNow={state.handleGenerateNow}
        onDelete={state.handleDelete}
      />

      <ConfirmDialog {...state.dialogProps} />

      <MobileFab icon={<AddIcon />} onClick={navigateToNew} label="New Recurring Invoice" />
    </>
  );
}
