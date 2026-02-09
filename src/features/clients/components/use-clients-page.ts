"use client";

import * as React from "react";
import { useClients, clientsApi } from "@app/features/clients";
import { useOptimisticDelete, useDebouncedValue, useItemMenu, useSort } from "@app/shared/hooks";
import { useAnnounce } from "@app/shared/ui/screen-reader-announcer";
import { queryKeys } from "@app/shared/config/query";
import { PAGINATION, SEARCH } from "@app/shared/config/config";
import type { Client } from "@app/shared/schemas/api";

function filterAndSortClients(
  clients: Client[] | undefined,
  pendingIds: Set<string>,
  search: string,
  sortColumn: string,
  sortDirection: "asc" | "desc"
): Client[] {
  if (!clients) {
    return [];
  }
  const lowerSearch = search.toLowerCase();
  const filtered = clients.filter((client) => {
    if (pendingIds.has(client.id)) {
      return false;
    }
    return (
      search === "" ||
      client.name.toLowerCase().includes(lowerSearch) ||
      client.email.toLowerCase().includes(lowerSearch)
    );
  });
  return filtered.sort((a, b) => {
    let comparison = 0;
    switch (sortColumn) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "email":
        comparison = a.email.localeCompare(b.email);
        break;
      case "createdAt":
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      default:
        comparison = a.name.localeCompare(b.name);
    }
    return sortDirection === "asc" ? comparison : -comparison;
  });
}

export function useClientsPage() {
  const { data: clients, isLoading, error } = useClients();
  const { deleteItem, pendingIds } = useOptimisticDelete({
    queryKey: queryKeys.clients,
    getId: (client: { id: string }) => client.id,
    entityName: "Client",
    deleteFn: clientsApi.delete,
  });

  const announce = useAnnounce();
  const menu = useItemMenu(clients);
  const { sortColumn, sortDirection, handleSort } = useSort("name");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(PAGINATION.DEFAULT_PAGE_SIZE);

  const debouncedSearch = useDebouncedValue(searchQuery, SEARCH.DEBOUNCE_MS);

  const filteredClients = React.useMemo(
    () => filterAndSortClients(clients, pendingIds, debouncedSearch, sortColumn, sortDirection),
    [clients, pendingIds, debouncedSearch, sortColumn, sortDirection]
  );

  React.useEffect(() => {
    setPage(0);
  }, [debouncedSearch]);

  React.useEffect(() => {
    if (debouncedSearch) {
      announce(`${filteredClients.length} client${filteredClients.length !== 1 ? "s" : ""} found`);
    }
  }, [filteredClients.length, debouncedSearch, announce]);

  const handleDelete = () => {
    if (!menu.selectedItem) {
      return;
    }
    const client = menu.selectedItem;
    menu.closeMenu();
    deleteItem(client);
  };

  const handleEdit = () => {
    menu.closeMenuKeepSelection();
    setEditDialogOpen(true);
  };

  return {
    clients,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    createDialogOpen,
    setCreateDialogOpen,
    editDialogOpen,
    setEditDialogOpen,
    filteredClients,
    selectedClient: menu.selectedItem,
    selectedClientId: menu.selectedId,
    setSelectedClientId: (_id: string | null) => {},
    menuAnchorEl: menu.menuAnchorEl,
    handleSort,
    handleMenuOpen: menu.openMenu,
    handleMenuClose: menu.closeMenu,
    handleDelete,
    handleEdit,
    sortColumn,
    sortDirection,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
  };
}
