"use client";

import * as React from "react";

import { PAGINATION, SEARCH } from "@app/shared/config/config";
import { useDebouncedValue } from "@app/shared/hooks";
import type { RecurringInvoice } from "@app/shared/schemas";
import { useAnnounce } from "@app/shared/ui/screen-reader-announcer";

export function useRecurringFiltering(
  recurring: RecurringInvoice[] | undefined,
  pendingIds: Set<string>
) {
  const announce = useAnnounce();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(PAGINATION.DEFAULT_PAGE_SIZE);

  const debouncedSearch = useDebouncedValue(searchQuery, SEARCH.DEBOUNCE_MS);

  const filteredRecurring = React.useMemo(() => {
    if (!recurring) {
      return [];
    }

    return recurring.filter((item) => {
      if (pendingIds.has(item.id)) {
        return false;
      }

      if (debouncedSearch === "") {
        return true;
      }

      const query = debouncedSearch.toLowerCase();

      return (
        item.name.toLowerCase().includes(query) ||
        item.client.name.toLowerCase().includes(query) ||
        item.client.email.toLowerCase().includes(query)
      );
    });
  }, [recurring, pendingIds, debouncedSearch]);

  React.useEffect(() => {
    setPage(0);
  }, [debouncedSearch]);

  React.useEffect(() => {
    if (debouncedSearch) {
      announce(
        `${filteredRecurring.length} recurring invoice${filteredRecurring.length !== 1 ? "s" : ""} found`
      );
    }
  }, [filteredRecurring.length, debouncedSearch, announce]);

  const handlePageChange = React.useCallback((_event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleRowsPerPageChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    },
    []
  );

  return {
    searchQuery,
    setSearchQuery,
    filteredRecurring,
    page,
    rowsPerPage,
    handlePageChange,
    handleRowsPerPageChange,
  };
}
