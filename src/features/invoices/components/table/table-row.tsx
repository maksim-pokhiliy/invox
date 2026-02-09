"use client";

import { Box, Checkbox, Chip, TableCell, Typography, alpha, useTheme } from "@mui/material";
import { DataTableRow, DataTableActions } from "@app/shared/ui/data-table";
import { formatCurrency, formatDateCompact } from "@app/shared/lib/format";
import { STATUS_CONFIG, getStatusColor } from "../../constants/invoice";
import { UI } from "@app/shared/config/config";
import type { InvoiceData } from "../invoice-row";

interface InvoiceTableRowProps {
  invoice: InvoiceData;
  height?: number;
  dataIndex?: number;
  selected?: boolean;
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
  onToggleSelect,
  onRowClick,
  onMenuOpen,
  onPrefetch,
}: InvoiceTableRowProps) {
  const theme = useTheme();
  const status = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.DRAFT;
  const statusColor = getStatusColor(theme, invoice.status);

  return (
    <DataTableRow
      onClick={() => onRowClick(invoice.id)}
      onMouseEnter={() => onPrefetch(invoice.id)}
      selected={selected}
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
        <Chip
          label={status.label}
          size="small"
          icon={
            <Box
              component="span"
              sx={{
                width: UI.STATUS_DOT_SIZE,
                height: UI.STATUS_DOT_SIZE,
                borderRadius: "50%",
                bgcolor: statusColor,
                display: "inline-block",
                ml: 0.5,
              }}
            />
          }
          sx={{
            fontWeight: 500,
            bgcolor: alpha(statusColor, UI.ALPHA_MUTED),
            color: statusColor,
            "& .MuiChip-icon": {
              color: statusColor,
            },
          }}
        />
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
