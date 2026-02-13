"use client";

import DeleteIcon from "@mui/icons-material/Delete";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PaymentIcon from "@mui/icons-material/Payment";
import {
  alpha,
  Chip,
  Collapse,
  Divider,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";

import { UI } from "@app/shared/config/config";
import { PAYMENT_METHOD_LABELS } from "@app/shared/config/payment-method";
import { formatCurrency, formatDateTime } from "@app/shared/lib/format";
import type { Payment } from "@app/shared/schemas/api";

interface PaymentHistoryProps {
  payments: Payment[];
  currency: string;
  isPaid: boolean;
  expanded: boolean;
  onToggle: () => void;
  onDeletePayment: (paymentId: string) => void;
}

export function PaymentHistory({
  payments,
  currency,
  isPaid,
  expanded,
  onToggle,
  onDeletePayment,
}: PaymentHistoryProps) {
  const theme = useTheme();

  if (!payments || payments.length === 0) {
    return null;
  }

  return (
    <Paper sx={{ borderRadius: 3, overflow: "hidden", mb: 3 }}>
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          p: 2,
          cursor: "pointer",
          "&:hover": { bgcolor: alpha(theme.palette.primary.main, UI.ALPHA_HOVER) },
        }}
        onClick={onToggle}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <PaymentIcon color="success" />
          <Typography variant="subtitle1" fontWeight={600}>
            Payment History
          </Typography>
          <Chip label={payments.length} size="small" color="success" />
        </Stack>
        {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </Stack>
      <Collapse in={expanded}>
        <Divider />
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Method</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Note</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Amount
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, width: 60 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{formatDateTime(payment.paidAt)}</TableCell>
                  <TableCell>
                    <Chip
                      label={PAYMENT_METHOD_LABELS[payment.method]}
                      size="small"
                      color="default"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {payment.note || "—"}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight={600} color="success.main">
                      {formatCurrency(payment.amount, currency)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {!isPaid && (
                      <Tooltip title="Delete payment">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => onDeletePayment(payment.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Collapse>
    </Paper>
  );
}
