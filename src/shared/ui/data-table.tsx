"use client";

import * as React from "react";
import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Tooltip,
  alpha,
  useTheme,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { PAGINATION, UI } from "@app/shared/config/config";

export interface DataTableColumn {
  id: string;
  label: string;
  sortable?: boolean;
  hideOnMobile?: boolean;
  align?: "left" | "right";
  renderHeader?: () => React.ReactNode;
}

interface DataTablePagination {
  page: number;
  rowsPerPage: number;
  totalCount: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

interface DataTableProps {
  columns: DataTableColumn[];
  children: React.ReactNode;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (column: string) => void;
  pagination?: DataTablePagination;
  footer?: React.ReactNode;
  stickyHeader?: boolean;
  maxHeight?: number;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

function HeaderCellContent({
  col,
  sortColumn,
  sortDirection,
  onSort,
}: {
  col: DataTableColumn;
  sortColumn?: string;
  sortDirection: "asc" | "desc";
  onSort?: (column: string) => void;
}) {
  if (col.renderHeader) {
    return <>{col.renderHeader()}</>;
  }

  if (col.sortable === false || !onSort) {
    return <span style={{ fontWeight: 600 }}>{col.label}</span>;
  }

  return (
    <TableSortLabel
      active={sortColumn === col.id}
      direction={sortColumn === col.id ? sortDirection : "asc"}
      onClick={() => onSort(col.id)}
      sx={{ fontWeight: 600 }}
    >
      {col.label}
    </TableSortLabel>
  );
}

export function DataTable({
  columns,
  children,
  sortColumn,
  sortDirection = "asc",
  onSort,
  pagination,
  footer,
  stickyHeader,
  maxHeight,
  containerRef,
  onKeyDown,
}: DataTableProps) {
  const theme = useTheme();

  return (
    <Paper sx={{ borderRadius: 3, overflow: "hidden" }} onKeyDown={onKeyDown}>
      <TableContainer
        ref={containerRef}
        sx={{
          maxHeight,
          "& .MuiTableHead-root": {
            bgcolor: alpha(theme.palette.primary.main, UI.ALPHA_HOVER),
          },
        }}
      >
        <Table stickyHeader={stickyHeader}>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  align={col.align}
                  sortDirection={sortColumn === col.id ? sortDirection : false}
                  sx={col.hideOnMobile ? { display: { xs: "none", md: "table-cell" } } : undefined}
                >
                  <HeaderCellContent
                    col={col}
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={onSort}
                  />
                </TableCell>
              ))}
              <TableCell sx={{ fontWeight: 600, width: 48 }} />
            </TableRow>
          </TableHead>
          <TableBody>{children}</TableBody>
        </Table>
      </TableContainer>
      {footer}
      {!footer && pagination && (
        <TablePagination
          component="div"
          count={pagination.totalCount}
          page={pagination.page}
          onPageChange={pagination.onPageChange}
          rowsPerPage={pagination.rowsPerPage}
          onRowsPerPageChange={pagination.onRowsPerPageChange}
          rowsPerPageOptions={[...PAGINATION.PAGE_SIZE_OPTIONS]}
        />
      )}
    </Paper>
  );
}

interface DataTableRowProps {
  children: React.ReactNode;
  onClick?: () => void;
  onMouseEnter?: () => void;
  selected?: boolean;
  height?: number;
  dataIndex?: number;
  sx?: Record<string, unknown>;
}

export function DataTableRow({
  children,
  onClick,
  onMouseEnter,
  selected,
  height,
  dataIndex,
  sx,
}: DataTableRowProps) {
  const theme = useTheme();

  return (
    <TableRow
      hover
      selected={selected}
      data-index={dataIndex}
      sx={{
        cursor: onClick ? "pointer" : undefined,
        height,
        "&:hover": {
          bgcolor: alpha(theme.palette.primary.main, UI.ALPHA_HOVER),
        },
        ...sx,
      }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      {children}
    </TableRow>
  );
}

interface DataTableActionsProps {
  onMenuOpen: (event: React.MouseEvent<HTMLElement>) => void;
  ariaLabel?: string;
}

export function DataTableActions({ onMenuOpen, ariaLabel = "Actions" }: DataTableActionsProps) {
  return (
    <TableCell>
      <Tooltip title="Actions">
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onMenuOpen(e);
          }}
          sx={{ color: "text.secondary" }}
          aria-label={ariaLabel}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </TableCell>
  );
}
