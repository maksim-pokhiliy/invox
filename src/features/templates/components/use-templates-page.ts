"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTemplates, templatesApi, type Template } from "@app/features/templates";
import { useOptimisticDelete, useDebouncedValue, useItemMenu, useSort } from "@app/shared/hooks";
import { useAnnounce } from "@app/shared/ui/screen-reader-announcer";
import { queryKeys } from "@app/shared/config/query";
import { SEARCH } from "@app/shared/config/config";
import { calculateEstimatedTotal } from "./templates-table";

function useSortedTemplates(
  templates: Template[] | undefined,
  pendingIds: Set<string>,
  debouncedSearch: string,
  sortColumn: string,
  sortDirection: "asc" | "desc"
) {
  return React.useMemo(() => {
    if (!templates) {
      return undefined;
    }
    let filtered = templates.filter((t) => !pendingIds.has(t.id));

    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          (t.description && t.description.toLowerCase().includes(query))
      );
    }

    return filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortColumn) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "items":
          comparison = a.items.length - b.items.length;
          break;
        case "total":
          comparison = calculateEstimatedTotal(a) - calculateEstimatedTotal(b);
          break;
        case "updatedAt":
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        default:
          comparison = 0;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [templates, pendingIds, debouncedSearch, sortColumn, sortDirection]);
}

export function useTemplatesPage() {
  const router = useRouter();
  const { data: templates, isLoading, error } = useTemplates();
  const { deleteItem, pendingIds } = useOptimisticDelete<Template>({
    queryKey: queryKeys.templates,
    getId: (template) => template.id,
    entityName: "Template",
    deleteFn: templatesApi.delete,
  });

  const menu = useItemMenu(templates);
  const { sortColumn, sortDirection, handleSort } = useSort("updatedAt", "desc");
  const [searchQuery, setSearchQuery] = React.useState("");

  const announce = useAnnounce();
  const debouncedSearch = useDebouncedValue(searchQuery, SEARCH.DEBOUNCE_MS);
  const allTemplatesCount = templates ? templates.filter((t) => !pendingIds.has(t.id)).length : 0;

  const sortedTemplates = useSortedTemplates(
    templates,
    pendingIds,
    debouncedSearch,
    sortColumn,
    sortDirection
  );

  const sortedCount = sortedTemplates?.length ?? 0;
  React.useEffect(() => {
    if (debouncedSearch && sortedCount > 0) {
      announce(`${sortedCount} template${sortedCount !== 1 ? "s" : ""} found`);
    }
  }, [sortedCount, debouncedSearch, announce]);

  const handleDelete = React.useCallback(() => {
    if (!menu.selectedItem) {
      return;
    }
    const template = menu.selectedItem;
    menu.closeMenu();
    deleteItem(template);
  }, [menu, deleteItem]);

  const handleEdit = React.useCallback(() => {
    if (!menu.selectedItem) {
      return;
    }
    const templateId = menu.selectedItem.id;
    menu.closeMenu();
    router.push(`/app/templates/${templateId}/edit`);
  }, [menu, router]);

  const handleUseTemplate = React.useCallback(
    (template: Template) => {
      router.push(`/app/invoices/new?templateId=${template.id}`);
    },
    [router]
  );

  const navigateToNewTemplate = React.useCallback(() => {
    router.push("/app/templates/new");
  }, [router]);

  return {
    isLoading,
    error,
    sortedTemplates,
    allTemplatesCount,
    searchQuery,
    setSearchQuery,
    menuAnchorEl: menu.menuAnchorEl,
    selectedTemplate: menu.selectedItem,
    sortColumn,
    sortDirection,
    handleMenuOpen: menu.openMenu,
    handleMenuClose: menu.closeMenu,
    handleDelete,
    handleEdit,
    handleUseTemplate,
    handleSort,
    navigateToNewTemplate,
  };
}
