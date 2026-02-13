"use client";

import * as React from "react";

import { SEARCH } from "@app/shared/config/config";
import { useDebouncedValue } from "@app/shared/hooks";
import type { InvoiceListItem } from "@app/shared/schemas/api";

export function useInvoicesFiltering(
  invoices: InvoiceListItem[] | undefined,
  initialStatus: string
) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>(initialStatus);
  const [sortColumn, setSortColumn] = React.useState<string>("createdAt");
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("desc");

  const debouncedSearch = useDebouncedValue(searchQuery, SEARCH.DEBOUNCE_MS);

  const filteredInvoices = React.useMemo(() => {
    if (!invoices) {
      return [];
    }

    const filtered = invoices.filter((invoice) => {
      const q = debouncedSearch.toLowerCase();
      const matchesSearch =
        q === "" ||
        invoice.publicId.toLowerCase().includes(q) ||
        invoice.client.name.toLowerCase().includes(q) ||
        invoice.client.email.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "ALL" || invoice.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    return filtered.sort((a, b) => {
      const comparison = compareByColumn(a, b, sortColumn);

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [invoices, debouncedSearch, statusFilter, sortColumn, sortDirection]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  return {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sortColumn,
    sortDirection,
    debouncedSearch,
    filteredInvoices,
    handleSort,
  };
}

export function compareByColumn(a: InvoiceListItem, b: InvoiceListItem, column: string): number {
  switch (column) {
    case "publicId":
      return a.publicId.localeCompare(b.publicId);
    case "client":
      return a.client.name.localeCompare(b.client.name);
    case "total":
      return a.total - b.total;
    case "dueDate":
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    case "status":
      return a.status.localeCompare(b.status);
    case "createdAt":
    default:
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  }
}

export function useInvoicesPagination(
  filteredInvoices: InvoiceListItem[],
  debouncedSearch: string,
  statusFilter: string
) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [showAll, setShowAll] = React.useState(false);

  React.useEffect(() => {
    setPage(0);
  }, [debouncedSearch, statusFilter]);

  const paginatedInvoices = React.useMemo(() => {
    if (showAll) {
      return filteredInvoices;
    }

    const start = page * rowsPerPage;

    return filteredInvoices.slice(start, start + rowsPerPage);
  }, [filteredInvoices, page, rowsPerPage, showAll]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return {
    page,
    rowsPerPage,
    showAll,
    setShowAll,
    paginatedInvoices,
    handleChangePage,
    handleChangeRowsPerPage,
  };
}
