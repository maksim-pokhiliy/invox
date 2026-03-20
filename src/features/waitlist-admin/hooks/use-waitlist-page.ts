"use client";

import * as React from "react";

import { PAGINATION, SEARCH } from "@app/shared/config/config";
import { queryKeys } from "@app/shared/config/query";
import {
  useDebouncedValue,
  useItemMenu,
  useOptimisticDelete,
  useSort,
  useToast,
} from "@app/shared/hooks";
import { useAnnounce } from "@app/shared/ui/screen-reader-announcer";

import type { WaitlistEntry } from "../api";
import { waitlistAdminApi } from "../api";
import { useApproveEntry, useWaitlistEntries } from "./use-waitlist-admin";

function filterAndSortEntries(
  entries: WaitlistEntry[] | undefined,
  pendingIds: Set<string>,
  search: string,
  sortColumn: string,
  sortDirection: "asc" | "desc"
): WaitlistEntry[] {
  if (!entries) {
    return [];
  }

  const lowerSearch = search.toLowerCase();
  const filtered = entries.filter((entry) => {
    if (pendingIds.has(entry.id)) {
      return false;
    }

    return search === "" || entry.email.toLowerCase().includes(lowerSearch);
  });

  return filtered.sort((a, b) => {
    let comparison = 0;

    switch (sortColumn) {
      case "email":
        comparison = a.email.localeCompare(b.email);
        break;
      case "status":
        comparison = a.status.localeCompare(b.status);
        break;
      case "createdAt":
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      default:
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }

    return sortDirection === "asc" ? comparison : -comparison;
  });
}

export function useWaitlistPage() {
  const { data: entries, isLoading, error } = useWaitlistEntries();
  const { deleteItem, pendingIds } = useOptimisticDelete({
    queryKey: queryKeys.waitlistEntries,
    getId: (entry: { id: string }) => entry.id,
    entityName: "Entry",
    deleteFn: waitlistAdminApi.delete,
  });

  const approveEntry = useApproveEntry();
  const toast = useToast();
  const announce = useAnnounce();
  const menu = useItemMenu(entries);
  const { sortColumn, sortDirection, handleSort } = useSort("createdAt", "desc");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(PAGINATION.DEFAULT_PAGE_SIZE);

  const debouncedSearch = useDebouncedValue(searchQuery, SEARCH.DEBOUNCE_MS);

  const filteredEntries = React.useMemo(
    () => filterAndSortEntries(entries, pendingIds, debouncedSearch, sortColumn, sortDirection),
    [entries, pendingIds, debouncedSearch, sortColumn, sortDirection]
  );

  React.useEffect(() => {
    setPage(0);
  }, [debouncedSearch]);

  React.useEffect(() => {
    if (debouncedSearch) {
      announce(`${filteredEntries.length} entr${filteredEntries.length !== 1 ? "ies" : "y"} found`);
    }
  }, [filteredEntries.length, debouncedSearch, announce]);

  const handleApprove = async () => {
    if (!menu.selectedItem) {
      return;
    }

    const entry = menu.selectedItem;

    menu.closeMenu();

    try {
      await approveEntry.mutateAsync(entry.email);
      toast.success(`Approval email sent to ${entry.email}`);
    } catch {
      toast.error("Failed to approve entry");
    }
  };

  const handleDelete = () => {
    if (!menu.selectedItem) {
      return;
    }

    const entry = menu.selectedItem;

    menu.closeMenu();
    deleteItem(entry);
  };

  return {
    entries,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    filteredEntries,
    selectedEntry: menu.selectedItem,
    menuAnchorEl: menu.menuAnchorEl,
    handleSort,
    handleMenuOpen: menu.openMenu,
    handleMenuClose: menu.closeMenu,
    handleApprove,
    handleDelete,
    sortColumn,
    sortDirection,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
  };
}
