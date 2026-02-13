"use client";

import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { alpha, Box, Button, Chip, Stack, Typography, useTheme } from "@mui/material";

import { UI } from "@app/shared/config/config";
import { getStatusColor, STATUS_CONFIG } from "@app/shared/config/invoice-status";
import { formatCurrency, formatDateShort } from "@app/shared/lib/format";
import { EmptyState } from "@app/shared/ui/empty-state";
import { EmptyInvoicesIllustration } from "@app/shared/ui/illustrations/empty-invoices";
import { CardSkeleton } from "@app/shared/ui/skeletons";

import type { RecentInvoice } from "../api";

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
        icon={<ReceiptLongIcon />}
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
          <Stack
            key={invoice.id}
            direction="row"
            sx={{
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
            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
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
                  fontSize: "caption.fontSize",
                }}
              />
            </Stack>
          </Stack>
        );
      })}
    </Box>
  );
}
