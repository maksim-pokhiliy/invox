"use client";

import * as React from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Alert,
  Divider,
  alpha,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import PaymentIcon from "@mui/icons-material/Payment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { Spinner } from "@app/components/feedback/Loading";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface Invoice {
  id: string;
  publicId: string;
  status: string;
  currency: string;
  subtotal: number;
  total: number;
  dueDate: string;
  paidAt: string | null;
  createdAt: string;
  client: {
    name: string;
    email: string;
  };
  items: InvoiceItem[];
  sender: {
    name: string;
    address: string;
    taxId: string;
  };
}

interface Branding {
  logoUrl: string | null;
  primaryColor: string;
  accentColor: string;
}

interface Props {
  publicId: string;
  invoice: Invoice;
  branding: Branding;
  hasStripe: boolean;
  justPaid: boolean;
  wasCanceled: boolean;
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount / 100);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

const statusConfig: Record<
  string,
  { color: "success" | "error" | "info" | "warning" | "default"; label: string }
> = {
  PAID: { color: "success", label: "Paid" },
  OVERDUE: { color: "error", label: "Overdue" },
  SENT: { color: "info", label: "Sent" },
  VIEWED: { color: "info", label: "Viewed" },
  DRAFT: { color: "default", label: "Draft" },
};

export default function PublicInvoiceView({
  publicId,
  invoice,
  branding,
  hasStripe,
  justPaid,
  wasCanceled,
}: Props) {
  const brandPrimary = branding.primaryColor;
  const brandAccent = branding.accentColor;
  const [viewTracked, setViewTracked] = React.useState(false);
  const [isPayLoading, setIsPayLoading] = React.useState(false);

  React.useEffect(() => {
    if (!viewTracked) {
      fetch(`/api/public/invoices/${publicId}/viewed`, {
        method: "POST",
      }).catch(console.error);
      setViewTracked(true);
    }
  }, [publicId, viewTracked]);

  const handlePrint = () => {
    window.print();
  };

  const handlePay = async () => {
    setIsPayLoading(true);
    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: invoice.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error("Payment error:", error);
      alert("Failed to initiate payment. Please try again.");
    } finally {
      setIsPayLoading(false);
    }
  };

  const isPaid = invoice.status === "PAID";
  const isPayable = !isPaid && hasStripe;
  const isOverdue = invoice.status === "OVERDUE";
  const status = statusConfig[invoice.status] || statusConfig.DRAFT;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        py: 4,
      }}
    >
      <Container maxWidth="md">
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            mb: 4,
            "@media print": { display: "none" },
          }}
        >
          {branding.logoUrl ? (
            <Box
              component="img"
              src={branding.logoUrl}
              alt="Company logo"
              sx={{
                maxWidth: 180,
                maxHeight: 60,
                objectFit: "contain",
              }}
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <>
              <ReceiptLongIcon sx={{ color: brandPrimary, fontSize: 28 }} />
              <Typography
                variant="h5"
                fontWeight={700}
                sx={{
                  background: `linear-gradient(135deg, ${brandPrimary} 0%, ${brandAccent} 100%)`,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {invoice.sender.name}
              </Typography>
            </>
          )}
        </Box>

        {justPaid && (
          <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 3, borderRadius: 2 }}>
            Payment successful! Thank you for your payment.
          </Alert>
        )}

        {wasCanceled && (
          <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
            Payment was canceled. You can try again when ready.
          </Alert>
        )}

        <Paper
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 3,
            "@media print": {
              boxShadow: "none",
              p: 0,
            },
          }}
        >
          {/* Invoice Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 4,
            }}
          >
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Invoice
              </Typography>
              <Typography variant="body1" color="text.secondary" fontWeight={500}>
                #{invoice.publicId}
              </Typography>
            </Box>
            <Chip
              label={status.label}
              color={status.color}
              sx={{
                fontWeight: 600,
                px: 1,
                "@media print": { display: "none" },
              }}
            />
          </Box>

          {/* From/To Section */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 4,
              mb: 4,
              p: 3,
              borderRadius: 2,
              bgcolor: alpha(brandPrimary, 0.04),
            }}
          >
            <Box>
              <Typography variant="overline" color="text.secondary" fontWeight={600}>
                From
              </Typography>
              <Typography variant="h6" fontWeight={600} sx={{ mt: 1 }}>
                {invoice.sender.name}
              </Typography>
              {invoice.sender.address && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ whiteSpace: "pre-line", mt: 0.5 }}
                >
                  {invoice.sender.address}
                </Typography>
              )}
              {invoice.sender.taxId && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Tax ID: {invoice.sender.taxId}
                </Typography>
              )}
            </Box>

            <Box>
              <Typography variant="overline" color="text.secondary" fontWeight={600}>
                Bill To
              </Typography>
              <Typography variant="h6" fontWeight={600} sx={{ mt: 1 }}>
                {invoice.client.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {invoice.client.email}
              </Typography>
            </Box>
          </Box>

          {/* Dates Section */}
          <Box sx={{ display: "flex", gap: 4, mb: 4, flexWrap: "wrap" }}>
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
              <Typography
                variant="body1"
                fontWeight={500}
                color={isOverdue ? "error.main" : "text.primary"}
                sx={{ mt: 0.5 }}
              >
                {formatDate(invoice.dueDate)}
              </Typography>
            </Box>
            {invoice.paidAt && (
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  PAID DATE
                </Typography>
                <Typography variant="body1" fontWeight={500} color="success.main" sx={{ mt: 0.5 }}>
                  {formatDate(invoice.paidAt)}
                </Typography>
              </Box>
            )}
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Items Table */}
          <TableContainer>
            <Table>
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

          {/* Totals */}
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Box sx={{ minWidth: 280 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                <Typography color="text.secondary">Subtotal</Typography>
                <Typography>{formatCurrency(invoice.subtotal, invoice.currency)}</Typography>
              </Box>
              <Divider sx={{ my: 1.5 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h6" fontWeight={600}>
                  Total Due
                </Typography>
                <Typography variant="h5" fontWeight={700} sx={{ color: brandPrimary }}>
                  {formatCurrency(invoice.total, invoice.currency)}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Actions */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              mt: 5,
              justifyContent: "center",
              "@media print": { display: "none" },
            }}
          >
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              size="large"
              sx={{
                color: brandAccent,
                borderColor: brandAccent,
                "&:hover": {
                  borderColor: brandAccent,
                  bgcolor: alpha(brandAccent, 0.04),
                },
              }}
            >
              Print / Save PDF
            </Button>

            {isPayable && (
              <Button
                variant="contained"
                startIcon={isPayLoading ? <Spinner size={20} /> : <PaymentIcon />}
                onClick={handlePay}
                disabled={isPayLoading}
                size="large"
                sx={{
                  bgcolor: brandPrimary,
                  "&:hover": { bgcolor: brandPrimary, filter: "brightness(0.9)" },
                }}
              >
                Pay Now
              </Button>
            )}

            {isPaid && (
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircleIcon />}
                disabled
                size="large"
              >
                Paid
              </Button>
            )}
          </Box>
        </Paper>

        {/* Footer */}
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{
            mt: 4,
            "@media print": { display: "none" },
          }}
        >
          Powered by <strong>Invox</strong> - Simple Invoice Management
        </Typography>
      </Container>
    </Box>
  );
}
