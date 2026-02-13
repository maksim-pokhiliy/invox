"use client";

import AddIcon from "@mui/icons-material/Add";
import DownloadIcon from "@mui/icons-material/Download";
import { Alert } from "@mui/material";

import { ConfirmDialog } from "@app/shared/ui/confirm-dialog";
import { MobileFab } from "@app/shared/ui/mobile-fab";
import { PageHeader } from "@app/shared/ui/page-header";

import { useInvoicesPage } from "../hooks/use-invoices-page";
import { InvoicesContent } from "./invoices-content";
import { InvoicesHeaderActions } from "./invoices-header-actions";
import { InvoicesOverflowMenu } from "./invoices-overflow-menu";
import { InvoicesSearchFilters } from "./invoices-search-filters";
import { SelectionToolbar } from "./selection-toolbar";

export function InvoicesPageContent() {
  const state = useInvoicesPage();
  const hasInvoices = !state.isLoading && !!state.invoices && state.invoices.length > 0;

  return (
    <>
      <PageHeader
        title="Invoices"
        subtitle="Manage and track all your invoices"
        actions={
          <InvoicesHeaderActions
            hasInvoices={hasInvoices}
            onExport={state.handleExportCSV}
            onNew={state.navigateToNew}
          />
        }
      />

      {state.error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load invoices. Please try again.
        </Alert>
      )}

      <InvoicesSearchFilters
        searchQuery={state.searchQuery}
        setSearchQuery={state.setSearchQuery}
        statusFilter={state.statusFilter}
        setStatusFilter={state.setStatusFilter}
        filterDrawerOpen={state.filterDrawerOpen}
        setFilterDrawerOpen={state.setFilterDrawerOpen}
        invoicesCount={state.invoices?.length ?? 0}
        filteredCount={state.filteredInvoices.length}
        hasInvoices={hasInvoices}
      />

      {state.selectedIds.size > 0 && (
        <SelectionToolbar
          count={state.selectedIds.size}
          isProcessing={state.bulkProcessing}
          onDelete={state.handleBulkDelete}
          onExport={state.handleBulkExport}
          onMarkPaid={state.handleBulkMarkPaid}
          onSend={state.handleBulkSend}
          onClear={state.clearSelection}
        />
      )}

      <InvoicesContent
        isLoading={state.isLoading}
        invoices={state.invoices}
        filteredInvoices={state.filteredInvoices}
        paginatedInvoices={state.paginatedInvoices}
        showAll={state.showAll}
        setShowAll={state.setShowAll}
        virtualItems={state.virtualItems}
        totalSize={state.totalSize}
        parentRef={state.parentRef}
        page={state.page}
        rowsPerPage={state.rowsPerPage}
        onPageChange={state.handleChangePage}
        onRowsPerPageChange={state.handleChangeRowsPerPage}
        sortColumn={state.sortColumn}
        sortDirection={state.sortDirection}
        onSort={state.handleSort}
        onRowClick={state.navigateToInvoice}
        onMenuOpen={state.handleMenuOpen}
        onPrefetch={state.prefetchInvoice}
        onClearFilters={state.handleClearFilters}
        onCreateInvoice={state.navigateToNew}
        selectedIds={state.selectedIds}
        onToggleSelect={state.handleToggleSelect}
        onToggleSelectAll={state.handleToggleSelectAll}
      />

      <InvoicesOverflowMenu
        anchorEl={state.menuAnchorEl}
        onClose={state.handleMenuClose}
        selectedInvoiceStatus={state.selectedInvoice?.status}
        onViewDetails={state.handleViewDetails}
        onEdit={state.handleEdit}
        onDuplicate={state.handleDuplicate}
        onDelete={state.handleDelete}
      />

      <ConfirmDialog {...state.dialogProps} />

      <MobileFab
        icon={<AddIcon />}
        onClick={state.navigateToNew}
        label="Invoice actions"
        actions={[
          { icon: <AddIcon />, name: "New Invoice", onClick: state.navigateToNew },
          { icon: <DownloadIcon />, name: "Export CSV", onClick: state.handleExportCSV },
        ]}
      />
    </>
  );
}
