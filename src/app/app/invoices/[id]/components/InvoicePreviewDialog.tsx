"use client";

import {
  Box,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Divider,
  Alert,
  alpha,
  useTheme,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { formatCurrency, formatDate } from "@app/lib/format";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface InvoicePreviewDialogProps {
  open: boolean;
  onClose: () => void;
  onSend: () => void;
  invoice: {
    publicId: string;
    createdAt: string;
    dueDate: string;
    currency: string;
    subtotal: number;
    total: number;
    client: {
      name: string;
      email: string;
    };
    items: InvoiceItem[];
  };
}

export function InvoicePreviewDialog({
  open,
  onClose,
  onSend,
  invoice,
}: InvoicePreviewDialogProps) {
  const theme = useTheme();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, display: "flex", justifyContent: "space-between" }}>
        Invoice Preview
        <Chip label="Preview Mode" size="small" color="info" />
      </DialogTitle>
      <DialogContent>
        <Paper
          variant="outlined"
          sx={{
            p: 4,
            bgcolor: alpha(theme.palette.background.paper, 0.5),
            borderRadius: 2,
          }}
        >
          {/* Invoice Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
            <Box>
              <Typography variant="h4" fontWeight={700}>
                Invoice
              </Typography>
              <Typography variant="body1" color="text.secondary">
                #{invoice.publicId}
              </Typography>
            </Box>
            <Chip label="Draft" color="default" />
          </Box>

          {/* From/To */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 4,
              mb: 4,
              p: 3,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.02),
            }}
          >
            <Box>
              <Typography variant="overline" color="text.secondary" fontWeight={600}>
                From
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Your business info will appear here
              </Typography>
            </Box>
            <Box>
              <Typography variant="overline" color="text.secondary" fontWeight={600}>
                Bill To
              </Typography>
              <Typography variant="h6" fontWeight={600} sx={{ mt: 1 }}>
                {invoice.client.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {invoice.client.email}
              </Typography>
            </Box>
          </Box>

          {/* Dates */}
          <Box sx={{ display: "flex", gap: 4, mb: 4 }}>
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                INVOICE DATE
              </Typography>
              <Typography variant="body1" fontWeight={500} sx={{ mt: 0.5 }}>
                {formatDate(invoice.createdAt)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                DUE DATE
              </Typography>
              <Typography variant="body1" fontWeight={500} sx={{ mt: 0.5 }}>
                {formatDate(invoice.dueDate)}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Items */}
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Qty
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Unit Price
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Amount
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoice.items.map((item) => (
                  <TableRow key={item.id}>
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

          {/* Totals */}
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Box sx={{ minWidth: 250 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography color="text.secondary">Subtotal</Typography>
                <Typography>{formatCurrency(invoice.subtotal, invoice.currency)}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="h6" fontWeight={600}>
                  Total
                </Typography>
                <Typography variant="h6" fontWeight={700} color="primary.main">
                  {formatCurrency(invoice.total, invoice.currency)}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>

        <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
          This is how your invoice will appear to your client. Once sent, they will receive an email
          with a link to view and pay this invoice.
        </Alert>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" onClick={onSend} startIcon={<SendIcon />}>
          Send Invoice
        </Button>
      </DialogActions>
    </Dialog>
  );
}
