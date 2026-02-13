"use client";

import AddIcon from "@mui/icons-material/Add";
import PeopleIcon from "@mui/icons-material/People";
import { Button } from "@mui/material";

import type { Client } from "@app/shared/schemas";
import { EmptyState } from "@app/shared/ui/empty-state";
import { EmptyClientsIllustration } from "@app/shared/ui/illustrations/empty-clients";
import { NoResults } from "@app/shared/ui/no-results";
import { TableSkeleton } from "@app/shared/ui/skeletons";

import { ClientsTable } from "./clients-table";

type ClientListItem = Pick<Client, "id" | "name" | "email" | "createdAt">;

interface ClientsContentProps {
  isLoading: boolean;
  clients: ClientListItem[] | undefined;
  filteredClients: ClientListItem[];
  setSearchQuery: (query: string) => void;
  setCreateDialogOpen: (open: boolean) => void;
  handleMenuOpen: (event: React.MouseEvent<HTMLElement>, clientId: string) => void;
  sortColumn: string;
  sortDirection: "asc" | "desc";
  onSort: (column: string) => void;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ClientsContent({
  isLoading,
  clients,
  filteredClients,
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
}: ClientsContentProps) {
  if (isLoading) {
    return <TableSkeleton rows={5} columns={4} />;
  }

  if (clients && clients.length > 0 && filteredClients.length > 0) {
    return (
      <ClientsTable
        filteredClients={filteredClients}
        handleMenuOpen={handleMenuOpen}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={onSort}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    );
  }

  if (clients && clients.length > 0 && filteredClients.length === 0) {
    return <NoResults entity="clients" onClear={() => setSearchQuery("")} />;
  }

  return (
    <EmptyState
      icon={<PeopleIcon />}
      illustration={<EmptyClientsIllustration />}
      title="No clients yet"
      description="Add your first client to start creating invoices. Clients help you organize your billing and keep track of who you're working with."
      action={
        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Add Your First Client
        </Button>
      }
    />
  );
}
