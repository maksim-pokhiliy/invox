"use client";

import * as React from "react";
import {
  Box,
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  alpha,
  useTheme,
  IconButton,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { TableSkeleton } from "@app/components/feedback/Loading";
import { formatCurrency, formatDateCompact } from "@app/lib/format";
import { NoInvoicesFound, EmptyInvoicesState } from "./EmptyStates";
import type { InvoiceData } from "./InvoiceRow";

const statusConfig: Record<
  string,
  { color: "success" | "error" | "info" | "warning" | "default"; label: string }
> = {
  PAID: { color: "success", label: "Paid" },
  PARTIALLY_PAID: { color: "warning", label: "Partially Paid" },
  OVERDUE: { color: "error", label: "Overdue" },
  SENT: { color: "info", label: "Sent" },
  VIEWED: { color: "info", label: "Viewed" },
  DRAFT: { color: "default", label: "Draft" },
};

interface VirtualItem {
  index: number;
  start: number;
  end: number;
}

interface InvoicesContentProps {
  isLoading: boolean;
  invoices: InvoiceData[] | undefined;
  filteredInvoices: InvoiceData[];
  paginatedInvoices: InvoiceData[];
  showAll: boolean;
  setShowAll: (show: boolean) => void;
  virtualItems: VirtualItem[];
  totalSize: number;
  parentRef: React.RefObject<HTMLDivElement | null>;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  sortColumn: string;
  sortDirection: "asc" | "desc";
  onSort: (column: string) => void;
  onRowClick: (id: string) => void;
  onMenuOpen: (event: React.MouseEvent<HTMLElement>, id: string) => void;
  onPrefetch: (id: string) => void;
  onClearFilters: () => void;
  onCreateInvoice: () => void;
}

export function InvoicesContent({
  isLoading,
  invoices,
  filteredInvoices,
  paginatedInvoices,
  showAll,
  setShowAll,
  virtualItems,
  totalSize,
  parentRef,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  sortColumn,
  sortDirection,
  onSort,
  onRowClick,
  onMenuOpen,
  onPrefetch,
  onClearFilters,
  onCreateInvoice,
}: InvoicesContentProps) {
  if (isLoading) {
    return (
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <TableSkeleton rows={5} columns={6} />
      </Paper>
    );
  }

  if (invoices && invoices.length > 0 && filteredInvoices.length > 0) {
    return (
      <InvoicesTable
        filteredInvoices={filteredInvoices}
        paginatedInvoices={paginatedInvoices}
        showAll={showAll}
        setShowAll={setShowAll}
        virtualItems={virtualItems}
        totalSize={totalSize}
        parentRef={parentRef}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={onSort}
        onRowClick={onRowClick}
        onMenuOpen={onMenuOpen}
        onPrefetch={onPrefetch}
      />
    );
  }

  if (invoices && invoices.length > 0 && filteredInvoices.length === 0) {
    return <NoInvoicesFound onClearFilters={onClearFilters} />;
  }

  return <EmptyInvoicesState onCreateInvoice={onCreateInvoice} />;
}

interface InvoicesTableProps {
  filteredInvoices: InvoiceData[];
  paginatedInvoices: InvoiceData[];
  showAll: boolean;
  setShowAll: (show: boolean) => void;
  virtualItems: VirtualItem[];
  totalSize: number;
  parentRef: React.RefObject<HTMLDivElement | null>;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  sortColumn: string;
  sortDirection: "asc" | "desc";
  onSort: (column: string) => void;
  onRowClick: (id: string) => void;
  onMenuOpen: (event: React.MouseEvent<HTMLElement>, id: string) => void;
  onPrefetch: (id: string) => void;
}

function InvoicesTable({
  filteredInvoices,
  paginatedInvoices,
  showAll,
  setShowAll,
  virtualItems,
  totalSize,
  parentRef,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  sortColumn,
  sortDirection,
  onSort,
  onRowClick,
  onMenuOpen,
  onPrefetch,
}: InvoicesTableProps) {
  const theme = useTheme();

  const sortableHeaderSx = {
    fontWeight: 600,
    cursor: "pointer",
    userSelect: "none",
    "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.08) },
  };

  const renderSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return null;
    }
    if (sortDirection === "asc") {
      return <ArrowUpwardIcon sx={{ fontSize: 16 }} />;
    }
    return <ArrowDownwardIcon sx={{ fontSize: 16 }} />;
  };

  return (
    <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
      <TableContainer
        ref={showAll ? parentRef : undefined}
        sx={{
          maxHeight: showAll ? 600 : undefined,
          "& .MuiTableHead-root": {
            bgcolor: alpha(theme.palette.primary.main, 0.04),
          },
        }}
      >
        <Table stickyHeader={showAll}>
          <TableHead>
            <TableRow>
              <TableCell sx={sortableHeaderSx} onClick={() => onSort("publicId")}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  Invoice # {renderSortIcon("publicId")}
                </Box>
              </TableCell>
              <TableCell sx={sortableHeaderSx} onClick={() => onSort("client")}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  Client {renderSortIcon("client")}
                </Box>
              </TableCell>
              <TableCell sx={sortableHeaderSx} onClick={() => onSort("total")}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  Amount {renderSortIcon("total")}
                </Box>
              </TableCell>
              <TableCell sx={sortableHeaderSx} onClick={() => onSort("dueDate")}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  Due Date {renderSortIcon("dueDate")}
                </Box>
              </TableCell>
              <TableCell sx={sortableHeaderSx} onClick={() => onSort("status")}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  Status {renderSortIcon("status")}
                </Box>
              </TableCell>
              <TableCell sx={sortableHeaderSx} onClick={() => onSort("createdAt")}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  Created {renderSortIcon("createdAt")}
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 600, width: 48 }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {showAll ? (
              <VirtualizedRows
                filteredInvoices={filteredInvoices}
                virtualItems={virtualItems}
                totalSize={totalSize}
                onRowClick={onRowClick}
                onMenuOpen={onMenuOpen}
                onPrefetch={onPrefetch}
              />
            ) : (
              <PaginatedRows
                invoices={paginatedInvoices}
                onRowClick={onRowClick}
                onMenuOpen={onMenuOpen}
                onPrefetch={onPrefetch}
              />
            )}
          </TableBody>
        </Table>
        <TableFooter
          showAll={showAll}
          setShowAll={setShowAll}
          filteredCount={filteredInvoices.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      </TableContainer>
    </Paper>
  );
}

interface VirtualizedRowsProps {
  filteredInvoices: InvoiceData[];
  virtualItems: VirtualItem[];
  totalSize: number;
  onRowClick: (id: string) => void;
  onMenuOpen: (event: React.MouseEvent<HTMLElement>, id: string) => void;
  onPrefetch: (id: string) => void;
}

function VirtualizedRows({
  filteredInvoices,
  virtualItems,
  totalSize,
  onRowClick,
  onMenuOpen,
  onPrefetch,
}: VirtualizedRowsProps) {
  return (
    <>
      {virtualItems.length > 0 && (
        <TableRow style={{ height: virtualItems[0].start }}>
          <TableCell colSpan={7} sx={{ p: 0, border: 0 }} />
        </TableRow>
      )}
      {virtualItems.map((virtualRow) => {
        const invoice = filteredInvoices[virtualRow.index];
        return (
          <InvoiceTableRow
            key={invoice.id}
            invoice={invoice}
            height={65}
            dataIndex={virtualRow.index}
            onRowClick={onRowClick}
            onMenuOpen={onMenuOpen}
            onPrefetch={onPrefetch}
          />
        );
      })}
      {virtualItems.length > 0 && (
        <TableRow style={{ height: totalSize - (virtualItems[virtualItems.length - 1].end || 0) }}>
          <TableCell colSpan={7} sx={{ p: 0, border: 0 }} />
        </TableRow>
      )}
    </>
  );
}

interface PaginatedRowsProps {
  invoices: InvoiceData[];
  onRowClick: (id: string) => void;
  onMenuOpen: (event: React.MouseEvent<HTMLElement>, id: string) => void;
  onPrefetch: (id: string) => void;
}

function PaginatedRows({ invoices, onRowClick, onMenuOpen, onPrefetch }: PaginatedRowsProps) {
  return (
    <>
      {invoices.map((invoice) => (
        <InvoiceTableRow
          key={invoice.id}
          invoice={invoice}
          onRowClick={onRowClick}
          onMenuOpen={onMenuOpen}
          onPrefetch={onPrefetch}
        />
      ))}
    </>
  );
}

interface InvoiceTableRowProps {
  invoice: InvoiceData;
  height?: number;
  dataIndex?: number;
  onRowClick: (id: string) => void;
  onMenuOpen: (event: React.MouseEvent<HTMLElement>, id: string) => void;
  onPrefetch: (id: string) => void;
}

function InvoiceTableRow({
  invoice,
  height,
  dataIndex,
  onRowClick,
  onMenuOpen,
  onPrefetch,
}: InvoiceTableRowProps) {
  const theme = useTheme();
  const status = statusConfig[invoice.status] || statusConfig.DRAFT;

  return (
    <TableRow
      data-index={dataIndex}
      hover
      sx={{
        cursor: "pointer",
        transition: "background-color 0.2s",
        height,
        "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.04) },
      }}
      onMouseEnter={() => onPrefetch(invoice.id)}
      onClick={() => onRowClick(invoice.id)}
    >
      <TableCell>
        <Typography variant="body2" fontWeight={600} color="primary.main">
          {invoice.publicId}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2" fontWeight={500}>
          {invoice.client.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {invoice.client.email}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2" fontWeight={600}>
          {formatCurrency(invoice.total, invoice.currency)}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2" color="text.secondary">
          {formatDateCompact(invoice.dueDate)}
        </Typography>
      </TableCell>
      <TableCell>
        <Chip label={status.label} size="small" color={status.color} sx={{ fontWeight: 500 }} />
      </TableCell>
      <TableCell>
        <Typography variant="body2" color="text.secondary">
          {formatDateCompact(invoice.createdAt)}
        </Typography>
      </TableCell>
      <TableCell>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onMenuOpen(e, invoice.id);
          }}
          sx={{ color: "text.secondary" }}
          aria-label={`Actions for invoice ${invoice.publicId}`}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}

interface TableFooterProps {
  showAll: boolean;
  setShowAll: (show: boolean) => void;
  filteredCount: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function TableFooter({
  showAll,
  setShowAll,
  filteredCount,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: TableFooterProps) {
  if (showAll) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 2,
          py: 1,
          borderTop: 1,
          borderColor: "divider",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Showing all {filteredCount} invoices
        </Typography>
        <Button size="small" onClick={() => setShowAll(false)}>
          Use Pagination
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderTop: 1,
        borderColor: "divider",
      }}
    >
      <TablePagination
        component="div"
        count={filteredCount}
        page={page}
        onPageChange={onPageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={onRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 25, 50]}
        sx={{ flex: 1 }}
      />
      {filteredCount > 50 && (
        <Button size="small" onClick={() => setShowAll(true)} sx={{ mr: 2 }}>
          Show All
        </Button>
      )}
    </Box>
  );
}
