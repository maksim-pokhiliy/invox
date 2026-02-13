"use client";

import AddIcon from "@mui/icons-material/Add";
import RepeatIcon from "@mui/icons-material/Repeat";
import { alpha, Box, Button, Chip, Stack, TableCell, Typography, useTheme } from "@mui/material";

import { RESPONSIVE_SX, UI } from "@app/shared/config/config";
import { formatCurrency, formatDateCompact } from "@app/shared/lib/format";
import { DataTable, DataTableActions, DataTableRow } from "@app/shared/ui/data-table";
import { EmptyState } from "@app/shared/ui/empty-state";
import { EmptyRecurringIllustration } from "@app/shared/ui/illustrations/empty-recurring";
import { NoResults } from "@app/shared/ui/no-results";
import { TableSkeleton } from "@app/shared/ui/skeletons";

import type { RecurringInvoice } from "..";
import {
  RECURRING_COLUMNS,
  RECURRING_FREQUENCY_LABELS,
  RECURRING_STATUS_CONFIG,
} from "../constants";

interface RecurringContentProps {
  isLoading: boolean;
  recurring: RecurringInvoice[] | undefined;
  filteredRecurring: RecurringInvoice[];
  searchQuery: string;
  onClearSearch: () => void;
  onRowClick: (id: string) => void;
  handleMenuOpen: (event: React.MouseEvent<HTMLElement>, item: RecurringInvoice) => void;
  calculateTotal: (item: RecurringInvoice) => number;
  onCreateRecurring: () => void;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function RecurringContent({
  isLoading,
  recurring,
  filteredRecurring,
  searchQuery,
  onClearSearch,
  onRowClick,
  handleMenuOpen,
  calculateTotal,
  onCreateRecurring,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: RecurringContentProps) {
  const theme = useTheme();

  if (isLoading) {
    return <TableSkeleton rows={5} columns={7} />;
  }

  if (recurring && recurring.length > 0 && filteredRecurring.length === 0 && searchQuery) {
    return <NoResults entity="recurring invoices" onClear={onClearSearch} />;
  }

  if (filteredRecurring && filteredRecurring.length > 0) {
    const paginatedRecurring = filteredRecurring.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );

    return (
      <DataTable
        columns={RECURRING_COLUMNS}
        pagination={{
          page,
          rowsPerPage,
          totalCount: filteredRecurring.length,
          onPageChange,
          onRowsPerPageChange,
        }}
      >
        {paginatedRecurring.map((item) => (
          <DataTableRow key={item.id} onClick={() => onRowClick(item.id)}>
            <TableCell>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                <Box
                  sx={{
                    ...RESPONSIVE_SX.DESKTOP_ONLY,
                    width: UI.ICON_BADGE_SIZE,
                    height: UI.ICON_BADGE_SIZE,
                    borderRadius: 1.5,
                    bgcolor: alpha(theme.palette.primary.main, UI.ALPHA_MUTED),
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <RepeatIcon sx={{ fontSize: UI.ICON_SIZE_SM, color: "primary.main" }} />
                </Box>
                <Box>
                  <Typography fontWeight={500}>{item.name}</Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: { xs: "block", md: "none" } }}
                  >
                    {item.client.name}
                  </Typography>
                </Box>
              </Stack>
            </TableCell>
            <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
              <Typography variant="body2">{item.client.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {item.client.email}
              </Typography>
            </TableCell>
            <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
              {RECURRING_FREQUENCY_LABELS[item.frequency]}
            </TableCell>
            <TableCell>
              <Typography fontWeight={500}>
                {formatCurrency(calculateTotal(item), item.currency)}
              </Typography>
            </TableCell>
            <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
              <Typography variant="body2" color="text.secondary">
                {formatDateCompact(item.nextRunAt)}
              </Typography>
            </TableCell>
            <TableCell>
              <Chip
                label={RECURRING_STATUS_CONFIG[item.status].label}
                color={RECURRING_STATUS_CONFIG[item.status].color}
                size="small"
              />
            </TableCell>
            <DataTableActions
              onMenuOpen={(e) => handleMenuOpen(e, item)}
              ariaLabel={`Actions for ${item.name}`}
            />
          </DataTableRow>
        ))}
      </DataTable>
    );
  }

  return (
    <EmptyState
      icon={<RepeatIcon />}
      illustration={<EmptyRecurringIllustration />}
      title="No recurring invoices yet"
      description="Set up automatic invoice generation for regular clients"
      action={
        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          onClick={onCreateRecurring}
        >
          Create Recurring Invoice
        </Button>
      }
    />
  );
}
