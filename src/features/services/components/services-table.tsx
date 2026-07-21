"use client";

import { Chip, TableCell, Typography } from "@mui/material";

import { formatCents } from "@app/shared/lib/format";
import type { Service } from "@app/shared/schemas/api";
import {
  DataTable,
  DataTableActions,
  type DataTableColumn,
  DataTableRow,
} from "@app/shared/ui/data-table";

const COLUMNS: DataTableColumn[] = [
  { id: "name", label: "Name" },
  { id: "description", label: "Description", hideOnMobile: true },
  { id: "unit", label: "Unit", hideOnMobile: true },
  { id: "defaultPrice", label: "Default Price", hideOnMobile: true },
  { id: "active", label: "Status", hideOnMobile: true },
];

type ServiceListItem = Pick<
  Service,
  "id" | "name" | "description" | "unit" | "defaultPrice" | "active" | "createdAt"
>;

interface ServicesTableProps {
  filteredServices: ServiceListItem[];
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

export function ServicesTable({
  filteredServices,
  handleMenuOpen,
  sortColumn,
  sortDirection,
  onSort,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  defaultCurrency = "USD",
}: ServicesTableProps) {
  const paginatedServices = filteredServices.slice(
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
        totalCount: filteredServices.length,
        onPageChange,
        onRowsPerPageChange,
      }}
    >
      {paginatedServices.map((service) => (
        <DataTableRow key={service.id}>
          <TableCell>
            <Typography variant="body2" fontWeight={600}>
              {service.name}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: { xs: "block", md: "none" } }}
            >
              {formatCents(service.defaultPrice, defaultCurrency)}
              {service.unit ? ` / ${service.unit}` : ""}
            </Typography>
          </TableCell>
          <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
            <Typography variant="body2" color="text.secondary">
              {service.description || "—"}
            </Typography>
          </TableCell>
          <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
            <Typography variant="body2" color="text.secondary">
              {service.unit || "—"}
            </Typography>
          </TableCell>
          <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
            <Typography variant="body2" color="text.secondary">
              {formatCents(service.defaultPrice, defaultCurrency)}
            </Typography>
          </TableCell>
          <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
            <Chip
              label={service.active ? "Active" : "Inactive"}
              size="small"
              color={service.active ? "success" : "default"}
              variant="outlined"
            />
          </TableCell>
          <DataTableActions
            onMenuOpen={(e) => handleMenuOpen(e, service.id)}
            ariaLabel={`Actions for ${service.name}`}
          />
        </DataTableRow>
      ))}
    </DataTable>
  );
}
