"use client";

import AddIcon from "@mui/icons-material/Add";
import MiscellaneousServicesIcon from "@mui/icons-material/MiscellaneousServices";
import { Button } from "@mui/material";

import type { Service } from "@app/shared/schemas/api";
import { EmptyState } from "@app/shared/ui/empty-state";
import { NoResults } from "@app/shared/ui/no-results";
import { TableSkeleton } from "@app/shared/ui/skeletons";

import { ServicesTable } from "./services-table";

type ServiceListItem = Pick<
  Service,
  "id" | "name" | "description" | "unit" | "defaultPrice" | "active" | "createdAt"
>;

interface ServicesContentProps {
  isLoading: boolean;
  services: ServiceListItem[] | undefined;
  filteredServices: ServiceListItem[];
  setSearchQuery: (query: string) => void;
  setCreateDialogOpen: (open: boolean) => void;
  handleMenuOpen: (event: React.MouseEvent<HTMLElement>, serviceId: string) => void;
  sortColumn: string;
  sortDirection: "asc" | "desc";
  onSort: (column: string) => void;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  defaultCurrency?: string;
}

export function ServicesContent({
  isLoading,
  services,
  filteredServices,
  setSearchQuery,
  setCreateDialogOpen,
  handleMenuOpen,
  sortColumn,
  sortDirection,
  onSort,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  defaultCurrency,
}: ServicesContentProps) {
  if (isLoading) {
    return <TableSkeleton rows={5} columns={5} />;
  }

  if (services && services.length > 0 && filteredServices.length > 0) {
    return (
      <ServicesTable
        filteredServices={filteredServices}
        handleMenuOpen={handleMenuOpen}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={onSort}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        defaultCurrency={defaultCurrency}
      />
    );
  }

  if (services && services.length > 0 && filteredServices.length === 0) {
    return <NoResults entity="services" onClear={() => setSearchQuery("")} />;
  }

  return (
    <EmptyState
      icon={<MiscellaneousServicesIcon />}
      title="No services yet"
      description="Add your commonly performed services to quickly populate invoice line items. Your service catalog saves you time when creating invoices."
      action={
        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Add Your First Service
        </Button>
      }
    />
  );
}
