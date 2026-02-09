"use client";

import * as React from "react";
import { Checkbox } from "@mui/material";
import { DataTable, type DataTableColumn } from "@app/shared/ui/data-table";
import { useTableKeyboardNav } from "@app/shared/hooks";
import { InvoicesTableFooter } from "./table-footer";
import { VirtualizedRows, PaginatedRows } from "./table-rows";
import type { InvoiceData } from "../invoice-row";

interface VirtualItem {
  index: number;
  start: number;
  end: number;
}

const VIRTUAL_MAX_HEIGHT = 600;

const COLUMNS: DataTableColumn[] = [
  { id: "publicId", label: "Invoice #" },
  { id: "client", label: "Client" },
  { id: "total", label: "Amount" },
  { id: "dueDate", label: "Due Date", hideOnMobile: true },
  { id: "status", label: "Status" },
  { id: "createdAt", label: "Created", hideOnMobile: true },
];

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
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onToggleSelectAll?: () => void;
}

export function InvoicesTable({
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
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
}: InvoicesTableProps) {
  const displayedInvoices = showAll ? filteredInvoices : paginatedInvoices;
  const { onKeyDown: tableKeyDown } = useTableKeyboardNav(displayedInvoices.length, {
    onActivate: (index) => {
      const invoice = displayedInvoices[index];
      if (invoice) {
        onRowClick(invoice.id);
      }
    },
    onToggleSelect: onToggleSelect
      ? (index) => {
          const invoice = displayedInvoices[index];
          if (invoice) {
            onToggleSelect(invoice.id);
          }
        }
      : undefined,
  });

  const selectionCount = selectedIds?.size ?? 0;
  const totalCount = displayedInvoices.length;

  const selectionColumn: DataTableColumn | null = onToggleSelectAll
    ? {
        id: "_select",
        label: "",
        sortable: false,
        renderHeader: () => (
          <Checkbox
            indeterminate={selectionCount > 0 && selectionCount < totalCount}
            checked={totalCount > 0 && selectionCount === totalCount}
            onChange={onToggleSelectAll}
            size="small"
          />
        ),
      }
    : null;

  const allColumns = selectionColumn ? [selectionColumn, ...COLUMNS] : COLUMNS;

  return (
    <DataTable
      columns={allColumns}
      sortColumn={sortColumn}
      sortDirection={sortDirection}
      onSort={onSort}
      stickyHeader={showAll}
      maxHeight={showAll ? VIRTUAL_MAX_HEIGHT : undefined}
      containerRef={showAll ? parentRef : undefined}
      onKeyDown={tableKeyDown}
      footer={
        <InvoicesTableFooter
          showAll={showAll}
          setShowAll={setShowAll}
          filteredCount={filteredInvoices.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      }
    >
      {showAll ? (
        <VirtualizedRows
          filteredInvoices={filteredInvoices}
          virtualItems={virtualItems}
          totalSize={totalSize}
          selectedIds={selectedIds}
          onToggleSelect={onToggleSelect}
          onRowClick={onRowClick}
          onMenuOpen={onMenuOpen}
          onPrefetch={onPrefetch}
        />
      ) : (
        <PaginatedRows
          invoices={paginatedInvoices}
          selectedIds={selectedIds}
          onToggleSelect={onToggleSelect}
          onRowClick={onRowClick}
          onMenuOpen={onMenuOpen}
          onPrefetch={onPrefetch}
        />
      )}
    </DataTable>
  );
}
