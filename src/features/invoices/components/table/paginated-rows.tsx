"use client";

import type { InvoiceListItem } from "@app/shared/schemas/api";

import { InvoiceTableRow } from "./table-row";

interface PaginatedRowsProps {
  invoices: InvoiceListItem[];
  selectedIds?: Set<string>;
  focusedIndex?: number;
  onToggleSelect?: (id: string) => void;
  onRowClick: (id: string) => void;
  onMenuOpen: (event: React.MouseEvent<HTMLElement>, id: string) => void;
  onPrefetch: (id: string) => void;
}

export function PaginatedRows({
  invoices,
  selectedIds,
  focusedIndex,
  onToggleSelect,
  onRowClick,
  onMenuOpen,
  onPrefetch,
}: PaginatedRowsProps) {
  return (
    <>
      {invoices.map((invoice, index) => (
        <InvoiceTableRow
          key={invoice.id}
          invoice={invoice}
          dataIndex={index}
          selected={selectedIds?.has(invoice.id)}
          focused={focusedIndex === index}
          onToggleSelect={onToggleSelect}
          onRowClick={onRowClick}
          onMenuOpen={onMenuOpen}
          onPrefetch={onPrefetch}
        />
      ))}
    </>
  );
}
