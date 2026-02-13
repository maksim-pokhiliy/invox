"use client";

import { TableCell, TableRow } from "@mui/material";

import { VIRTUALIZATION } from "@app/shared/config/config";

import type { InvoiceData } from "../invoice-row";
import { InvoiceTableRow } from "./table-row";

interface VirtualItem {
  index: number;
  start: number;
  end: number;
}

interface VirtualizedRowsProps {
  filteredInvoices: InvoiceData[];
  virtualItems: VirtualItem[];
  totalSize: number;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onRowClick: (id: string) => void;
  onMenuOpen: (event: React.MouseEvent<HTMLElement>, id: string) => void;
  onPrefetch: (id: string) => void;
}

const TABLE_COLUMNS_BASE = 7;
const ROW_HEIGHT = VIRTUALIZATION.ROW_HEIGHT;

export function VirtualizedRows({
  filteredInvoices,
  virtualItems,
  totalSize,
  selectedIds,
  onToggleSelect,
  onRowClick,
  onMenuOpen,
  onPrefetch,
}: VirtualizedRowsProps) {
  const colSpan = onToggleSelect ? TABLE_COLUMNS_BASE + 1 : TABLE_COLUMNS_BASE;

  return (
    <>
      {virtualItems.length > 0 && (
        <TableRow style={{ height: virtualItems[0].start }}>
          <TableCell colSpan={colSpan} sx={{ p: 0, border: 0 }} />
        </TableRow>
      )}
      {virtualItems.map((virtualRow) => {
        const invoice = filteredInvoices[virtualRow.index];

        return (
          <InvoiceTableRow
            key={invoice.id}
            invoice={invoice}
            height={ROW_HEIGHT}
            dataIndex={virtualRow.index}
            selected={selectedIds?.has(invoice.id)}
            onToggleSelect={onToggleSelect}
            onRowClick={onRowClick}
            onMenuOpen={onMenuOpen}
            onPrefetch={onPrefetch}
          />
        );
      })}
      {virtualItems.length > 0 && (
        <TableRow style={{ height: totalSize - (virtualItems[virtualItems.length - 1].end || 0) }}>
          <TableCell colSpan={colSpan} sx={{ p: 0, border: 0 }} />
        </TableRow>
      )}
    </>
  );
}

interface PaginatedRowsProps {
  invoices: InvoiceData[];
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onRowClick: (id: string) => void;
  onMenuOpen: (event: React.MouseEvent<HTMLElement>, id: string) => void;
  onPrefetch: (id: string) => void;
}

export function PaginatedRows({
  invoices,
  selectedIds,
  onToggleSelect,
  onRowClick,
  onMenuOpen,
  onPrefetch,
}: PaginatedRowsProps) {
  return (
    <>
      {invoices.map((invoice) => (
        <InvoiceTableRow
          key={invoice.id}
          invoice={invoice}
          selected={selectedIds?.has(invoice.id)}
          onToggleSelect={onToggleSelect}
          onRowClick={onRowClick}
          onMenuOpen={onMenuOpen}
          onPrefetch={onPrefetch}
        />
      ))}
    </>
  );
}
