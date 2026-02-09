"use client";

import { Box, Button, Chip, Typography, alpha, useTheme } from "@mui/material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { EmptyState } from "@app/shared/ui/empty-state";
import { EmptyInvoicesIllustration } from "@app/shared/ui/illustrations/empty-invoices";
import { CardSkeleton } from "@app/shared/ui/loading";
import { formatCurrency, formatDateShort } from "@app/shared/lib/format";
import { STATUS_CONFIG, getStatusColor } from "@app/shared/config/invoice-status";
import { UI } from "@app/shared/config/config";

interface RecentInvoice {
  id: string;
  publicId: string;
  clientName: string;
  total: number;
  currency: string;
  status: string;
  createdAt: string;
}

interface RecentInvoicesContentProps {
  isLoading: boolean;
  invoices: RecentInvoice[] | undefined;
  onNavigate: (path: string) => void;
}

export function RecentInvoicesContent({
  isLoading,
  invoices,
  onNavigate,
}: RecentInvoicesContentProps) {
  const theme = useTheme();

  if (isLoading) {
    return <CardSkeleton />;
  }

  if (!invoices || invoices.length === 0) {
    return (
      <EmptyState
        icon={<ReceiptLongIcon sx={{ fontSize: 40, color: "primary.main" }} />}
        illustration={<EmptyInvoicesIllustration />}
        title="No invoices yet"
        description="Create your first invoice to see activity here"
        action={
          <Button variant="contained" onClick={() => onNavigate("/app/invoices/new")}>
            Create Your First Invoice
          </Button>
        }
      />
    );
  }

  return (
    <Box>
      {invoices.map((invoice) => {
        const statusLabel = STATUS_CONFIG[invoice.status]?.label || invoice.status;
        return (
          <Box
            key={invoice.id}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              py: 1.5,
              borderBottom: "1px solid",
              borderColor: "divider",
              cursor: "pointer",
              "&:hover": { bgcolor: alpha(theme.palette.primary.main, UI.ALPHA_HOVER) },
              "&:last-child": { borderBottom: "none" },
              mx: -1,
              px: 1,
              borderRadius: 1,
            }}
            onClick={() => onNavigate(`/app/invoices/${invoice.id}`)}
          >
            <Box>
              <Typography variant="body2" fontWeight={500}>
                #{invoice.publicId}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {invoice.clientName} &bull; {formatDateShort(invoice.createdAt)}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{ display: { xs: "none", sm: "block" } }}
              >
                {formatCurrency(invoice.total, invoice.currency)}
              </Typography>
              <Chip
                size="small"
                label={statusLabel}
                sx={{
                  bgcolor: alpha(getStatusColor(theme, invoice.status), UI.ALPHA_MUTED),
                  color: getStatusColor(theme, invoice.status),
                  fontWeight: 600,
                  fontSize: "0.7rem",
                }}
              />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
