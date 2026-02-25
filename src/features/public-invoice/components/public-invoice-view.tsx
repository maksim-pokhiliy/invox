"use client";

import * as React from "react";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
  Alert,
  alpha,
  Box,
  Chip,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import { FONT_FAMILY_MAP } from "@app/shared/config/config";
import { INVOICE_STATUS, STATUS_CONFIG } from "@app/shared/config/invoice-status";
import type { InvoiceItemGroupResponse, InvoiceItemResponse } from "@app/shared/schemas/api";

import { publicApi } from "../api";
import { InvoiceActions } from "./invoice-actions";
import { InvoiceDates } from "./invoice-dates";
import { InvoiceHeader } from "./invoice-header";
import { InvoiceItemsTable } from "./invoice-items-table";
import { InvoiceTotals } from "./invoice-totals";
import { PaymentReferenceBlock } from "./payment-reference-block";
import { SenderBillTo } from "./sender-bill-to";

interface Invoice {
  id: string;
  publicId: string;
  status: string;
  currency: string;
  subtotal: number;
  total: number;
  dueDate: string;
  periodStart: string | null;
  periodEnd: string | null;
  paidAt: string | null;
  createdAt: string;
  message: string | null;
  paymentReference: string | null;
  client: {
    name: string;
    email: string;
  };
  items: InvoiceItemResponse[];
  itemGroups?: InvoiceItemGroupResponse[];
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
  fontFamily: string | null;
}

interface Props {
  publicId: string;
  invoice: Invoice;
  branding: Branding;
  justPaid: boolean;
}

const PUBLIC_VISIBLE_STATUSES: Set<string> = new Set([INVOICE_STATUS.PAID, INVOICE_STATUS.OVERDUE]);

export default function PublicInvoiceView({ publicId, invoice, branding, justPaid }: Props) {
  const [viewTracked, setViewTracked] = React.useState(false);

  React.useEffect(() => {
    if (!viewTracked) {
      publicApi.markViewed(publicId).catch(console.error);
      setViewTracked(true);
    }
  }, [publicId, viewTracked]);

  const isPaid = invoice.status === INVOICE_STATUS.PAID;
  const isOverdue = invoice.status === INVOICE_STATUS.OVERDUE;
  const statusConfig = PUBLIC_VISIBLE_STATUSES.has(invoice.status)
    ? STATUS_CONFIG[invoice.status]
    : null;
  const fontStack = branding.fontFamily ? FONT_FAMILY_MAP[branding.fontFamily] : undefined;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        py: 4,
        ...(fontStack && {
          fontFamily: fontStack,
          "& .MuiTypography-root, & .MuiChip-label, & .MuiTableCell-root, & .MuiButton-root, & .MuiAlert-message":
            { fontFamily: "inherit" },
        }),
      }}
    >
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
          <Stack
            direction="row"
            sx={{
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
            {statusConfig && (
              <Chip
                label={statusConfig.label}
                color={statusConfig.color}
                sx={{ fontWeight: 600, px: 1, "@media print": { display: "none" } }}
              />
            )}
          </Stack>

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
            periodStart={invoice.periodStart}
            periodEnd={invoice.periodEnd}
          />
          <Divider sx={{ my: 3 }} />
          <InvoiceItemsTable
            items={invoice.items}
            itemGroups={invoice.itemGroups}
            currency={invoice.currency}
          />
          <Divider sx={{ my: 3 }} />
          <InvoiceTotals
            subtotal={invoice.subtotal}
            total={invoice.total}
            currency={invoice.currency}
            primaryColor={branding.primaryColor}
          />

          {invoice.message && (
            <Box
              sx={(theme) => ({
                mt: 4,
                p: 3,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.02),
              })}
            >
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                MESSAGE
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: "pre-line" }}>
                {invoice.message}
              </Typography>
            </Box>
          )}

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
          Powered by{" "}
          <a
            href="https://getpaid.dev"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "inherit", fontWeight: 600 }}
          >
            GetPaid
          </a>{" "}
          - Simple Invoice Management
        </Typography>
      </Container>
    </Box>
  );
}
