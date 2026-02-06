"use client";

import * as React from "react";
import { Box, Container, Paper, Typography, Chip, Alert, Divider } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { InvoiceHeader } from "./invoice-header";
import { SenderBillTo } from "./sender-bill-to";
import { InvoiceDates } from "./invoice-dates";
import { InvoiceItemsTable } from "./invoice-items-table";
import { InvoiceTotals } from "./invoice-totals";
import { InvoiceActions } from "./invoice-actions";
import { PaymentReferenceBlock } from "./payment-reference-block";

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
  paymentReference: string | null;
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
  justPaid: boolean;
}

const STATUS_CONFIG: Record<
  string,
  { color: "success" | "error" | "info" | "warning" | "default"; label: string }
> = {
  PAID: { color: "success", label: "Paid" },
  OVERDUE: { color: "error", label: "Overdue" },
  SENT: { color: "info", label: "Sent" },
  VIEWED: { color: "info", label: "Viewed" },
  DRAFT: { color: "default", label: "Draft" },
};

export default function PublicInvoiceView({ publicId, invoice, branding, justPaid }: Props) {
  const [viewTracked, setViewTracked] = React.useState(false);

  React.useEffect(() => {
    if (!viewTracked) {
      fetch(`/api/public/invoices/${publicId}/viewed`, { method: "POST" }).catch(console.error);
      setViewTracked(true);
    }
  }, [publicId, viewTracked]);

  const isPaid = invoice.status === "PAID";
  const isOverdue = invoice.status === "OVERDUE";
  const status = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.DRAFT;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 4 }}>
      <Container maxWidth="md">
        <InvoiceHeader
          logoUrl={branding.logoUrl}
          senderName={invoice.sender.name}
          primaryColor={branding.primaryColor}
          accentColor={branding.accentColor}
        />

        {justPaid && (
          <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 3, borderRadius: 2 }}>
            Payment received! Thank you for your payment.
          </Alert>
        )}

        <Paper
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 3,
            "@media print": { boxShadow: "none", p: 0 },
          }}
        >
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
              sx={{ fontWeight: 600, px: 1, "@media print": { display: "none" } }}
            />
          </Box>

          <SenderBillTo
            sender={invoice.sender}
            client={invoice.client}
            primaryColor={branding.primaryColor}
          />
          <InvoiceDates
            createdAt={invoice.createdAt}
            dueDate={invoice.dueDate}
            paidAt={invoice.paidAt}
            isOverdue={isOverdue}
          />
          <Divider sx={{ my: 3 }} />
          <InvoiceItemsTable items={invoice.items} currency={invoice.currency} />
          <Divider sx={{ my: 3 }} />
          <InvoiceTotals
            subtotal={invoice.subtotal}
            total={invoice.total}
            currency={invoice.currency}
            primaryColor={branding.primaryColor}
          />

          {invoice.paymentReference && !isPaid && (
            <PaymentReferenceBlock paymentReference={invoice.paymentReference} />
          )}

          <InvoiceActions isPaid={isPaid} accentColor={branding.accentColor} />
        </Paper>

        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ mt: 4, "@media print": { display: "none" } }}
        >
          Powered by <strong>Invox</strong> - Simple Invoice Management
        </Typography>
      </Container>
    </Box>
  );
}
