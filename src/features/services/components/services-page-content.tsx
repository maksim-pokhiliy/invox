"use client";

import AddIcon from "@mui/icons-material/Add";
import { Button } from "@mui/material";

import { RESPONSIVE_SX } from "@app/shared/config/config";
import { ListErrorState } from "@app/shared/ui/list-error-state";
import { MobileFab } from "@app/shared/ui/mobile-fab";
import { PageHeader } from "@app/shared/ui/page-header";

import { useUpdateService } from "../hooks";
import { useServicesPage } from "../hooks/use-services-page";
import { ServiceDialog } from "./service-dialog";
import { ServicesContent } from "./services-content";
import { ServicesOverflowMenu } from "./services-overflow-menu";
import { ServicesSearchField } from "./services-search-field";

export function ServicesPageContent() {
  const state = useServicesPage();
  const updateMutation = useUpdateService();

  const handleToggleActive = () => {
    if (!state.selectedService) {
      return;
    }

    const service = state.selectedService;

    state.handleMenuClose();
    updateMutation.mutate({
      id: service.id,
      data: { active: !service.active },
    });
  };

  const header = (
    <PageHeader
      title="Services"
      subtitle="Manage your service catalog"
      actions={
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => state.setCreateDialogOpen(true)}
          sx={RESPONSIVE_SX.DESKTOP_MD_ONLY}
        >
          Add Service
        </Button>
      }
    />
  );

  if (state.error) {
    return (
      <>
        {header}
        <ListErrorState entity="services" onRetry={() => void state.refetch()} />
      </>
    );
  }

  return (
    <>
      {header}

      {!state.isLoading && state.services && state.services.length > 0 && (
        <ServicesSearchField
          searchQuery={state.searchQuery}
          onSearchChange={state.setSearchQuery}
          filteredCount={state.filteredServices.length}
          totalCount={state.services.length}
        />
      )}

      <ServicesContent
        isLoading={state.isLoading}
        services={state.services}
        filteredServices={state.filteredServices}
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

      <ServicesOverflowMenu
        anchorEl={state.menuAnchorEl}
        onClose={state.handleMenuClose}
        onEdit={state.handleEdit}
        onToggleActive={handleToggleActive}
        onDelete={state.handleDelete}
        isActive={state.selectedService?.active ?? true}
      />

      <ServiceDialog
        open={state.createDialogOpen}
        onClose={() => state.setCreateDialogOpen(false)}
        mode="create"
      />

      {state.selectedService && (
        <ServiceDialog
          open={state.editDialogOpen}
          onClose={() => {
            state.setEditDialogOpen(false);
          }}
          mode="edit"
          service={state.selectedService}
        />
      )}

      <MobileFab
        icon={<AddIcon />}
        onClick={() => state.setCreateDialogOpen(true)}
        label="Add Service"
      />
    </>
  );
}
