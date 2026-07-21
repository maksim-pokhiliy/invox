"use client";

import * as React from "react";

import { ApiError, extractApiErrorMessage } from "@app/shared/api";
import { PAGINATION, SEARCH } from "@app/shared/config/config";
import { queryKeys } from "@app/shared/config/query";
import {
  useDebouncedValue,
  useItemMenu,
  useOptimisticDelete,
  useResetOnChange,
  useSort,
  useToast,
} from "@app/shared/hooks";
import type { Service } from "@app/shared/schemas/api";
import { useAnnounce } from "@app/shared/ui/screen-reader-announcer";

import { servicesApi, useServices } from "@app/features/services";

function filterAndSortServices(
  services: Service[] | undefined,
  pendingIds: Set<string>,
  search: string,
  sortColumn: string,
  sortDirection: "asc" | "desc"
): Service[] {
  if (!services) {
    return [];
  }

  const lowerSearch = search.toLowerCase();
  const filtered = services.filter((service) => {
    if (pendingIds.has(service.id)) {
      return false;
    }

    return search === "" || service.name.toLowerCase().includes(lowerSearch);
  });

  return filtered.sort((a, b) => {
    let comparison = 0;

    switch (sortColumn) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "defaultPrice":
        comparison = a.defaultPrice - b.defaultPrice;
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

export function useServicesPage() {
  const { data: services, isLoading, error, refetch } = useServices();
  const toast = useToast();
  const { deleteItem, pendingIds } = useOptimisticDelete({
    queryKey: queryKeys.services,
    getId: (service: { id: string }) => service.id,
    entityName: "Service",
    deleteFn: servicesApi.delete,
    onError: (err, entityName) => {
      if (err instanceof ApiError && err.code === "SERVICE_IN_USE") {
        toast.error(err.message, "Service in use");

        return;
      }

      toast.error(extractApiErrorMessage(err, `Failed to delete ${entityName.toLowerCase()}`));
    },
  });

  const announce = useAnnounce();
  const menu = useItemMenu(services);
  const { sortColumn, sortDirection, handleSort } = useSort("name");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(PAGINATION.DEFAULT_PAGE_SIZE);

  const debouncedSearch = useDebouncedValue(searchQuery, SEARCH.DEBOUNCE_MS);

  const filteredServices = React.useMemo(
    () => filterAndSortServices(services, pendingIds, debouncedSearch, sortColumn, sortDirection),
    [services, pendingIds, debouncedSearch, sortColumn, sortDirection]
  );

  useResetOnChange(() => setPage(0), [debouncedSearch]);

  React.useEffect(() => {
    if (debouncedSearch) {
      announce(
        `${filteredServices.length} service${filteredServices.length !== 1 ? "s" : ""} found`
      );
    }
  }, [filteredServices.length, debouncedSearch, announce]);

  const handleDelete = () => {
    if (!menu.selectedItem) {
      return;
    }

    const service = menu.selectedItem;

    menu.closeMenu();
    deleteItem(service);
  };

  const handleEdit = () => {
    menu.closeMenuKeepSelection();
    setEditDialogOpen(true);
  };

  return {
    services,
    isLoading,
    error,
    refetch,
    searchQuery,
    setSearchQuery,
    createDialogOpen,
    setCreateDialogOpen,
    editDialogOpen,
    setEditDialogOpen,
    filteredServices,
    selectedService: menu.selectedItem,
    selectedServiceId: menu.selectedId,
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
