"use client";

import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";

import { EmptyState } from "@app/shared/ui/empty-state";
import { NoResults } from "@app/shared/ui/no-results";
import { TableSkeleton } from "@app/shared/ui/skeletons";

import type { WaitlistEntry } from "../api";
import { WaitlistTable } from "./waitlist-table";

interface WaitlistContentProps {
  isLoading: boolean;
  entries: WaitlistEntry[] | undefined;
  filteredEntries: WaitlistEntry[];
  setSearchQuery: (query: string) => void;
  handleMenuOpen: (event: React.MouseEvent<HTMLElement>, id: string) => void;
  sortColumn: string;
  sortDirection: "asc" | "desc";
  onSort: (column: string) => void;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function WaitlistContent({
  isLoading,
  entries,
  filteredEntries,
  setSearchQuery,
  handleMenuOpen,
  sortColumn,
  sortDirection,
  onSort,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: WaitlistContentProps) {
  if (isLoading) {
    return <TableSkeleton rows={5} columns={3} />;
  }

  if (entries && entries.length > 0 && filteredEntries.length > 0) {
    return (
      <WaitlistTable
        entries={filteredEntries}
        handleMenuOpen={handleMenuOpen}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={onSort}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    );
  }

  if (entries && entries.length > 0 && filteredEntries.length === 0) {
    return <NoResults entity="waitlist entries" onClear={() => setSearchQuery("")} />;
  }

  return (
    <EmptyState
      icon={<HourglassEmptyIcon />}
      title="No waitlist entries yet"
      description="When users request access, their entries will appear here."
    />
  );
}
