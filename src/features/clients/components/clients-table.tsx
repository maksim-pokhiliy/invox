"use client";

import { TableCell, Typography } from "@mui/material";

import { formatDateCompact } from "@app/shared/lib/format";
import type { Client } from "@app/shared/schemas";
import {
  DataTable,
  DataTableActions,
  type DataTableColumn,
  DataTableRow,
} from "@app/shared/ui/data-table";

const COLUMNS: DataTableColumn[] = [
  { id: "name", label: "Name" },
  { id: "email", label: "Email", hideOnMobile: true },
  { id: "createdAt", label: "Created", hideOnMobile: true },
];

type ClientListItem = Pick<Client, "id" | "name" | "email" | "createdAt">;

interface ClientsTableProps {
  filteredClients: ClientListItem[];
  handleMenuOpen: (event: React.MouseEvent<HTMLElement>, clientId: string) => void;
  sortColumn: string;
  sortDirection: "asc" | "desc";
  onSort: (column: string) => void;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ClientsTable({
  filteredClients,
  handleMenuOpen,
  sortColumn,
  sortDirection,
  onSort,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: ClientsTableProps) {
  const paginatedClients = filteredClients.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <DataTable
      columns={COLUMNS}
      sortColumn={sortColumn}
      sortDirection={sortDirection}
      onSort={onSort}
      pagination={{
        page,
        rowsPerPage,
        totalCount: filteredClients.length,
        onPageChange,
        onRowsPerPageChange,
      }}
    >
      {paginatedClients.map((client) => (
        <DataTableRow key={client.id}>
          <TableCell>
            <Typography variant="body2" fontWeight={600}>
              {client.name}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: { xs: "block", md: "none" } }}
            >
              {client.email}
            </Typography>
          </TableCell>
          <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
            <Typography variant="body2" color="text.secondary">
              {client.email}
            </Typography>
          </TableCell>
          <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
            <Typography variant="body2" color="text.secondary">
              {formatDateCompact(client.createdAt)}
            </Typography>
          </TableCell>
          <DataTableActions
            onMenuOpen={(e) => handleMenuOpen(e, client.id)}
            ariaLabel={`Actions for ${client.name}`}
          />
        </DataTableRow>
      ))}
    </DataTable>
  );
}
