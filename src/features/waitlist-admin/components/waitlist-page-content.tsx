"use client";

import { Alert } from "@mui/material";

import { PageHeader } from "@app/shared/ui/page-header";

import { useWaitlistPage } from "../hooks/use-waitlist-page";
import { WaitlistContent } from "./waitlist-content";
import { WaitlistOverflowMenu } from "./waitlist-overflow-menu";
import { WaitlistSearchField } from "./waitlist-search-field";

export function WaitlistPageContent() {
  const state = useWaitlistPage();

  return (
    <>
      <PageHeader title="Waitlist" subtitle="Manage access requests" />

      {state.error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load waitlist entries. Please try again.
        </Alert>
      )}

      {!state.isLoading && state.entries && state.entries.length > 0 && (
        <WaitlistSearchField
          searchQuery={state.searchQuery}
          onSearchChange={state.setSearchQuery}
          filteredCount={state.filteredEntries.length}
          totalCount={state.entries.length}
        />
      )}

      <WaitlistContent
        isLoading={state.isLoading}
        entries={state.entries}
        filteredEntries={state.filteredEntries}
        setSearchQuery={state.setSearchQuery}
        handleMenuOpen={state.handleMenuOpen}
        sortColumn={state.sortColumn}
        sortDirection={state.sortDirection}
        onSort={state.handleSort}
        page={state.page}
        rowsPerPage={state.rowsPerPage}
        onPageChange={(_event, newPage) => state.setPage(newPage)}
        onRowsPerPageChange={(event) => {
          state.setRowsPerPage(parseInt(event.target.value, 10));
          state.setPage(0);
        }}
      />

      <WaitlistOverflowMenu
        anchorEl={state.menuAnchorEl}
        onClose={state.handleMenuClose}
        onApprove={state.handleApprove}
        onDelete={state.handleDelete}
        isPending={state.selectedEntry?.status === "PENDING"}
      />
    </>
  );
}
