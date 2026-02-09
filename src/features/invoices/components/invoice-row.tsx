"use client";

import { TableRow, TableCell, Typography, Chip, IconButton, alpha, useTheme } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { formatCurrency, formatDateCompact } from "@app/shared/lib/format";
import { STATUS_CONFIG } from "../constants/invoice";
import { UI } from "@app/shared/config/config";

export interface InvoiceData {
  id: string;
  publicId: string;
  status: string;
  total: number;
  currency: string;
  dueDate: string;
  createdAt: string;
  client: {
    name: string;
    email: string;
  };
}

interface InvoiceRowProps {
  invoice: InvoiceData;
  onRowClick: (id: string) => void;
  onMenuOpen: (event: React.MouseEvent<HTMLElement>, id: string) => void;
  onPrefetch: (id: string) => void;
  height?: number;
}

export function InvoiceRow({
  invoice,
  onRowClick,
  onMenuOpen,
  onPrefetch,
  height,
}: InvoiceRowProps) {
  const theme = useTheme();
  const status = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.DRAFT;

  return (
    <TableRow
      hover
      sx={{
        cursor: "pointer",
        height,
        "&:hover": {
          bgcolor: alpha(theme.palette.primary.main, UI.ALPHA_HOVER),
        },
      }}
      onMouseEnter={() => onPrefetch(invoice.id)}
      onClick={() => onRowClick(invoice.id)}
    >
      <TableCell>
        <Typography variant="body2" fontWeight={600} color="primary.main">
          {invoice.publicId}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2" fontWeight={500}>
          {invoice.client.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {invoice.client.email}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2" fontWeight={600}>
          {formatCurrency(invoice.total, invoice.currency)}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2" color="text.secondary">
          {formatDateCompact(invoice.dueDate)}
        </Typography>
      </TableCell>
      <TableCell>
        <Chip label={status.label} size="small" color={status.color} sx={{ fontWeight: 500 }} />
      </TableCell>
      <TableCell>
        <Typography variant="body2" color="text.secondary">
          {formatDateCompact(invoice.createdAt)}
        </Typography>
      </TableCell>
      <TableCell>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onMenuOpen(e, invoice.id);
          }}
          sx={{ color: "text.secondary" }}
          aria-label={`Actions for invoice ${invoice.publicId}`}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}
