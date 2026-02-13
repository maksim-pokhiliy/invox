"use client";

import {
  alpha,
  Box,
  Divider,
  LinearProgress,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";

import { formatCurrency } from "@app/shared/lib/format";
import type { Invoice } from "@app/shared/schemas/api";
import { InvoiceItemsTable } from "@app/shared/ui/invoice-items-table";

function TotalsSummary({
  invoice,
  remainingBalance,
}: {
  invoice: Invoice;
  remainingBalance: number;
}) {
  const theme = useTheme();
  const paidPercentage = invoice.total > 0 ? ((invoice.paidAmount || 0) / invoice.total) * 100 : 0;

  return (
    <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
      <Box sx={{ minWidth: 280 }}>
        <Stack direction="row" sx={{ justifyContent: "space-between", mb: 1.5 }}>
          <Typography color="text.secondary">Subtotal</Typography>
          <Typography>{formatCurrency(invoice.subtotal, invoice.currency)}</Typography>
        </Stack>
        <Divider sx={{ my: 1.5 }} />
        <Stack
          direction="row"
          sx={{ justifyContent: "space-between", alignItems: "center", mb: 1.5 }}
        >
          <Typography variant="h6" fontWeight={600}>
            Total
          </Typography>
          <Typography variant="h5" fontWeight={700} color="primary.main">
            {formatCurrency(invoice.total, invoice.currency)}
          </Typography>
        </Stack>
        {(invoice.paidAmount || 0) > 0 && (
          <>
            <Stack direction="row" sx={{ justifyContent: "space-between", mb: 1 }}>
              <Typography color="success.main" fontWeight={500}>
                Paid
              </Typography>
              <Typography color="success.main" fontWeight={500}>
                -{formatCurrency(invoice.paidAmount || 0, invoice.currency)}
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={paidPercentage}
              sx={{
                height: 6,
                borderRadius: 1,
                mb: 1.5,
                bgcolor: alpha(theme.palette.success.main, 0.1),
                "& .MuiLinearProgress-bar": { bgcolor: "success.main" },
              }}
            />
            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
              <Typography
                fontWeight={600}
                color={remainingBalance > 0 ? "error.main" : "success.main"}
              >
                {remainingBalance > 0 ? "Balance Due" : "Fully Paid"}
              </Typography>
              <Typography
                variant="h6"
                fontWeight={700}
                color={remainingBalance > 0 ? "error.main" : "success.main"}
              >
                {formatCurrency(remainingBalance, invoice.currency)}
              </Typography>
            </Stack>
          </>
        )}
      </Box>
    </Stack>
  );
}

export function BillingCard({
  invoice,
  remainingBalance,
}: {
  invoice: Invoice;
  remainingBalance: number;
}) {
  return (
    <Paper sx={{ p: 4, mb: 3, borderRadius: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="overline" color="text.secondary" sx={{ mb: 1, display: "block" }}>
          Bill To
        </Typography>
        <Typography variant="h6" fontWeight={600}>
          {invoice.client.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {invoice.client.email}
        </Typography>
      </Box>

      <Divider sx={{ my: 3 }} />

      <InvoiceItemsTable
        items={invoice.items}
        itemGroups={invoice.itemGroups}
        currency={invoice.currency}
      />

      <Divider sx={{ my: 3 }} />
      <TotalsSummary invoice={invoice} remainingBalance={remainingBalance} />
    </Paper>
  );
}
