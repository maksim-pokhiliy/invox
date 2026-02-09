"use client";

import { useParams } from "next/navigation";
import { Box, Button, Alert } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { AppLayout } from "@app/shared/layout/app-layout";
import { CardSkeleton } from "@app/shared/ui/loading";
import { ConfirmDialog } from "@app/shared/ui/confirm-dialog";
import { useInvoice } from "@app/features/invoices";
import { STATUS_CONFIG } from "@app/shared/config/invoice-status";
import type { Invoice } from "@app/shared/schemas/api";
import {
  InvoiceTimeline,
  PaymentHistory,
  ActivityHistory,
  SendDialog,
  MarkPaidDialog,
  RecordPaymentDialog,
  InvoicePreviewDialog,
} from "@app/features/invoices/components";
import { useInvoiceDetail } from "./use-invoice-detail";
import { DetailHeader } from "./detail-header";
import { BillingCard } from "./billing-card";

type InvoiceDetailReturn = ReturnType<typeof useInvoiceDetail>;

function DetailDialogs({
  invoice,
  detail,
  remainingBalance,
}: {
  invoice: Invoice;
  detail: InvoiceDetailReturn;
  remainingBalance: number;
}) {
  return (
    <>
      <SendDialog
        open={detail.sendDialogOpen}
        onClose={() => detail.setSendDialogOpen(false)}
        onConfirm={detail.handleSendInvoice}
        isLoading={detail.sendMutation.isPending}
        clientEmail={invoice.client.email}
      />
      <MarkPaidDialog
        open={detail.markPaidDialogOpen}
        onClose={() => detail.setMarkPaidDialogOpen(false)}
        onConfirm={detail.handleMarkPaid}
        isLoading={detail.markPaidMutation.isPending}
      />
      <RecordPaymentDialog
        open={detail.paymentDialogOpen}
        onClose={() => detail.setPaymentDialogOpen(false)}
        onConfirm={detail.handleRecordPayment}
        isLoading={detail.recordPaymentMutation.isPending}
        remainingBalance={remainingBalance}
        currency={invoice.currency}
      />
      <ConfirmDialog {...detail.dialogProps} />
      <InvoicePreviewDialog
        open={detail.previewDialogOpen}
        onClose={() => detail.setPreviewDialogOpen(false)}
        onSend={() => {
          detail.setPreviewDialogOpen(false);
          detail.setSendDialogOpen(true);
        }}
        invoice={invoice}
      />
    </>
  );
}

export function InvoiceDetailContent() {
  const params = useParams();
  const invoiceId = String(params.id);
  const { data: invoice, isLoading, error } = useInvoice(invoiceId);
  const detail = useInvoiceDetail(invoiceId, invoice);

  if (isLoading) {
    return (
      <AppLayout>
        <CardSkeleton />
      </AppLayout>
    );
  }

  if (error || !invoice) {
    return (
      <AppLayout>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          Failed to load invoice. Please try again.
        </Alert>
      </AppLayout>
    );
  }

  const isDraft = invoice.status === "DRAFT";
  const isPaid = invoice.status === "PAID";
  const isPartiallyPaid = invoice.status === "PARTIALLY_PAID";
  const isOverdue = invoice.status === "OVERDUE";
  const status = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.DRAFT;
  const remainingBalance = invoice.total - (invoice.paidAmount || 0);

  return (
    <AppLayout>
      <DetailHeader
        invoice={invoice}
        status={status}
        isDraft={isDraft}
        isPaid={isPaid}
        isPartiallyPaid={isPartiallyPaid}
        invoiceId={invoiceId}
        detail={detail}
      />

      <InvoiceTimeline
        dueDate={invoice.dueDate}
        sentAt={invoice.sentAt}
        viewedAt={invoice.viewedAt}
        paidAt={invoice.paidAt}
        paymentMethod={invoice.paymentMethod}
        isOverdue={isOverdue}
      />

      <BillingCard invoice={invoice} remainingBalance={remainingBalance} />

      <PaymentHistory
        payments={invoice.payments || []}
        currency={invoice.currency}
        isPaid={isPaid}
        expanded={detail.paymentsExpanded}
        onToggle={() => detail.setPaymentsExpanded(!detail.paymentsExpanded)}
        onDeletePayment={detail.handleDeletePayment}
      />

      {!isDraft && (
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Button
            variant="text"
            endIcon={<OpenInNewIcon />}
            onClick={() => window.open(`/i/${invoice.publicId}`, "_blank")}
          >
            View Public Invoice Page
          </Button>
        </Box>
      )}

      <ActivityHistory
        events={invoice.events || []}
        expanded={detail.auditLogExpanded}
        onToggle={() => detail.setAuditLogExpanded(!detail.auditLogExpanded)}
      />

      <DetailDialogs invoice={invoice} detail={detail} remainingBalance={remainingBalance} />
    </AppLayout>
  );
}
