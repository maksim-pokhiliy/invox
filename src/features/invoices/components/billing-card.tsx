"use client";

import {
  Box,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  alpha,
  useTheme,
  LinearProgress,
} from "@mui/material";
import { formatCurrency } from "@app/shared/lib/format";
import type { Invoice } from "@app/shared/schemas/api";

export function TotalsSummary({
  invoice,
  remainingBalance,
}: {
  invoice: Invoice;
  remainingBalance: number;
}) {
  const theme = useTheme();
  const paidPercentage = invoice.total > 0 ? ((invoice.paidAmount || 0) / invoice.total) * 100 : 0;

  return (
    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
      <Box sx={{ minWidth: 280 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
          <Typography color="text.secondary">Subtotal</Typography>
          <Typography>{formatCurrency(invoice.subtotal, invoice.currency)}</Typography>
        </Box>
        <Divider sx={{ my: 1.5 }} />
        <Box
          sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}
        >
          <Typography variant="h6" fontWeight={600}>
            Total
          </Typography>
          <Typography variant="h5" fontWeight={700} color="primary.main">
            {formatCurrency(invoice.total, invoice.currency)}
          </Typography>
        </Box>
        {(invoice.paidAmount || 0) > 0 && (
          <>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography color="success.main" fontWeight={500}>
                Paid
              </Typography>
              <Typography color="success.main" fontWeight={500}>
                -{formatCurrency(invoice.paidAmount || 0, invoice.currency)}
              </Typography>
            </Box>
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
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
            </Box>
          </>
        )}
      </Box>
    </Box>
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

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, border: 0 }}>Description</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, border: 0 }}>
                Qty
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, border: 0 }}>
                Unit Price
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, border: 0 }}>
                Amount
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoice.items.map((item) => (
              <TableRow key={item.id} sx={{ "&:last-child td": { border: 0 } }}>
                <TableCell>{item.description}</TableCell>
                <TableCell align="right">{item.quantity}</TableCell>
                <TableCell align="right">
                  {formatCurrency(item.unitPrice, invoice.currency)}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 500 }}>
                  {formatCurrency(item.amount, invoice.currency)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Divider sx={{ my: 3 }} />
      <TotalsSummary invoice={invoice} remainingBalance={remainingBalance} />
    </Paper>
  );
}
