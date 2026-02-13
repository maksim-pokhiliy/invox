"use client";

import AddIcon from "@mui/icons-material/Add";
import { Alert, Button } from "@mui/material";

import { RESPONSIVE_SX } from "@app/shared/config/config";
import { MobileFab } from "@app/shared/ui/mobile-fab";
import { PageHeader } from "@app/shared/ui/page-header";

import { useClientsPage } from "../hooks/use-clients-page";
import { ClientDialog } from "./client-dialog";
import { ClientsContent } from "./clients-content";
import { ClientsOverflowMenu } from "./clients-overflow-menu";
import { ClientsSearchField } from "./clients-search-field";

export function ClientsPageContent() {
  const state = useClientsPage();

  return (
    <>
      <PageHeader
        title="Clients"
        subtitle="Manage your clients and contacts"
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => state.setCreateDialogOpen(true)}
            sx={RESPONSIVE_SX.DESKTOP_ONLY}
          >
            Add Client
          </Button>
        }
      />

      {state.error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load clients. Please try again.
        </Alert>
      )}

      {!state.isLoading && state.clients && state.clients.length > 0 && (
        <ClientsSearchField
          searchQuery={state.searchQuery}
          onSearchChange={state.setSearchQuery}
          filteredCount={state.filteredClients.length}
          totalCount={state.clients.length}
        />
      )}

      <ClientsContent
        isLoading={state.isLoading}
        clients={state.clients}
        filteredClients={state.filteredClients}
        setSearchQuery={state.setSearchQuery}
        setCreateDialogOpen={state.setCreateDialogOpen}
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

      <ClientsOverflowMenu
        anchorEl={state.menuAnchorEl}
        onClose={state.handleMenuClose}
        onEdit={state.handleEdit}
        onDelete={state.handleDelete}
      />

      <ClientDialog
        open={state.createDialogOpen}
        onClose={() => state.setCreateDialogOpen(false)}
        mode="create"
      />

      {state.selectedClient && (
        <ClientDialog
          open={state.editDialogOpen}
          onClose={() => {
            state.setEditDialogOpen(false);
            state.setSelectedClientId(null);
          }}
          mode="edit"
          client={state.selectedClient}
        />
      )}

      <MobileFab
        icon={<AddIcon />}
        onClick={() => state.setCreateDialogOpen(true)}
        label="Add Client"
      />
    </>
  );
}
