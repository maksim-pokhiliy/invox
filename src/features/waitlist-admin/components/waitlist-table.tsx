"use client";

import { TableCell, Typography } from "@mui/material";

import { formatDateCompact } from "@app/shared/lib/format";
import {
  DataTable,
  DataTableActions,
  type DataTableColumn,
  DataTableRow,
} from "@app/shared/ui/data-table";

import type { WaitlistEntry } from "../api";
import { WaitlistStatusChip } from "./waitlist-status-chip";

const COLUMNS: DataTableColumn[] = [
  { id: "email", label: "Email" },
  { id: "status", label: "Status", sortable: false },
  { id: "createdAt", label: "Joined", hideOnMobile: true },
];

interface WaitlistTableProps {
  entries: WaitlistEntry[];
  handleMenuOpen: (event: React.MouseEvent<HTMLElement>, id: string) => void;
  sortColumn: string;
  sortDirection: "asc" | "desc";
  onSort: (column: string) => void;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function WaitlistTable({
  entries,
  handleMenuOpen,
  sortColumn,
  sortDirection,
  onSort,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: WaitlistTableProps) {
  const paginated = entries.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <DataTable
      columns={COLUMNS}
      sortColumn={sortColumn}
      sortDirection={sortDirection}
      onSort={onSort}
      pagination={{
        page,
        rowsPerPage,
        totalCount: entries.length,
        onPageChange,
        onRowsPerPageChange,
      }}
    >
      {paginated.map((entry) => (
        <DataTableRow key={entry.id}>
          <TableCell>
            <Typography variant="body2" fontWeight={600}>
              {entry.email}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: { xs: "block", md: "none" } }}
            >
              {formatDateCompact(entry.createdAt)}
            </Typography>
          </TableCell>
          <TableCell>
            <WaitlistStatusChip status={entry.status} />
          </TableCell>
          <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
            <Typography variant="body2" color="text.secondary">
              {formatDateCompact(entry.createdAt)}
            </Typography>
          </TableCell>
          <DataTableActions
            onMenuOpen={(e) => handleMenuOpen(e, entry.id)}
            ariaLabel={`Actions for ${entry.email}`}
          />
        </DataTableRow>
      ))}
    </DataTable>
  );
}
