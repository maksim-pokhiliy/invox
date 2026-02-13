"use client";

import { Button, Stack, TablePagination, Typography } from "@mui/material";

import { PAGINATION } from "@app/shared/config/config";

const SHOW_ALL_THRESHOLD = 50;

interface TableFooterProps {
  showAll: boolean;
  setShowAll: (show: boolean) => void;
  filteredCount: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function InvoicesTableFooter({
  showAll,
  setShowAll,
  filteredCount,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: TableFooterProps) {
  if (showAll) {
    return (
      <Stack
        direction="row"
        sx={{
          justifyContent: "space-between",
          alignItems: "center",
          px: 2,
          py: 1,
          borderTop: 1,
          borderColor: "divider",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Showing all {filteredCount} invoices
        </Typography>
        <Button size="small" onClick={() => setShowAll(false)}>
          Use Pagination
        </Button>
      </Stack>
    );
  }

  return (
    <Stack
      direction="row"
      sx={{
        justifyContent: "space-between",
        alignItems: "center",
        borderTop: 1,
        borderColor: "divider",
      }}
    >
      <TablePagination
        component="div"
        count={filteredCount}
        page={page}
        onPageChange={onPageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={onRowsPerPageChange}
        rowsPerPageOptions={[...PAGINATION.PAGE_SIZE_OPTIONS]}
        sx={{ flex: 1 }}
      />
      {filteredCount > SHOW_ALL_THRESHOLD && (
        <Button size="small" onClick={() => setShowAll(true)} sx={{ mr: 2 }}>
          Show All
        </Button>
      )}
    </Stack>
  );
}
