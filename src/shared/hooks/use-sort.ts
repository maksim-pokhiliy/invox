"use client";

import * as React from "react";

type SortDirection = "asc" | "desc";

interface UseSortResult {
  sortColumn: string;
  sortDirection: SortDirection;
  handleSort: (column: string) => void;
}

export function useSort(
  defaultColumn: string,
  defaultDirection: SortDirection = "asc"
): UseSortResult {
  const [sortColumn, setSortColumn] = React.useState(defaultColumn);
  const [sortDirection, setSortDirection] = React.useState<SortDirection>(defaultDirection);

  const handleSort = React.useCallback(
    (column: string) => {
      if (sortColumn === column) {
        setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortColumn(column);
        setSortDirection("asc");
      }
    },
    [sortColumn]
  );

  return { sortColumn, sortDirection, handleSort };
}
