"use client";

import * as React from "react";

import { NoResults } from "@app/shared/ui/no-results";
import { TableSkeleton } from "@app/shared/ui/skeletons";

import { EmptyInvoicesState } from "./empty-states";
import type { InvoiceData } from "./invoice-row";
import { InvoicesTable } from "./table";

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
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onToggleSelectAll?: () => void;
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
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
}: InvoicesContentProps) {
  if (isLoading) {
    return <TableSkeleton rows={5} columns={6} />;
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
        selectedIds={selectedIds}
        onToggleSelect={onToggleSelect}
        onToggleSelectAll={onToggleSelectAll}
      />
    );
  }

  if (invoices && invoices.length > 0 && filteredInvoices.length === 0) {
    return <NoResults entity="invoices" onClear={onClearFilters} />;
  }

  return <EmptyInvoicesState onCreateInvoice={onCreateInvoice} />;
}
