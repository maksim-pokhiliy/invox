"use client";

import { Checkbox, Chip, TableCell, Typography } from "@mui/material";

import { formatCurrency, formatDateCompact } from "@app/shared/lib/format";
import type { InvoiceListItem } from "@app/shared/schemas/api";
import { DataTableActions, DataTableRow } from "@app/shared/ui/data-table";

import { STATUS_CONFIG } from "../../constants/invoice";

interface InvoiceTableRowProps {
  invoice: InvoiceListItem;
  height?: number;
  dataIndex?: number;
  selected?: boolean;
  focused?: boolean;
  onToggleSelect?: (id: string) => void;
  onRowClick: (id: string) => void;
  onMenuOpen: (event: React.MouseEvent<HTMLElement>, id: string) => void;
  onPrefetch: (id: string) => void;
}

export function InvoiceTableRow({
  invoice,
  height,
  dataIndex,
  selected,
  focused,
  onToggleSelect,
  onRowClick,
  onMenuOpen,
  onPrefetch,
}: InvoiceTableRowProps) {
  const status = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.DRAFT;

  return (
    <DataTableRow
      onClick={() => onRowClick(invoice.id)}
      onMouseEnter={() => onPrefetch(invoice.id)}
      selected={selected}
      focused={focused}
      height={height}
      dataIndex={dataIndex}
    >
      {onToggleSelect && (
        <TableCell padding="checkbox">
          <Checkbox
            checked={!!selected}
            onClick={(e) => e.stopPropagation()}
            onChange={() => onToggleSelect(invoice.id)}
            size="small"
          />
        </TableCell>
      )}
      <TableCell>
        <Typography variant="body2" fontWeight={600} color="primary.main">
          {invoice.publicId}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2" fontWeight={500}>
          {invoice.client.name}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: { xs: "none", md: "block" } }}
        >
          {invoice.client.email}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2" fontWeight={600}>
          {formatCurrency(invoice.total, invoice.currency)}
        </Typography>
      </TableCell>
      <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
        <Typography variant="body2" color="text.secondary">
          {formatDateCompact(invoice.dueDate)}
        </Typography>
      </TableCell>
      <TableCell>
        <Chip label={status.label} size="small" color={status.color} sx={{ fontWeight: 500 }} />
      </TableCell>
      <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
        <Typography variant="body2" color="text.secondary">
          {formatDateCompact(invoice.createdAt)}
        </Typography>
      </TableCell>
      <DataTableActions
        onMenuOpen={(e) => onMenuOpen(e, invoice.id)}
        ariaLabel={`Actions for invoice ${invoice.publicId}`}
      />
    </DataTableRow>
  );
}
