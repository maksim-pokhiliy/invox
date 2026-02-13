"use client";

import * as React from "react";

import { useRecentItems } from "@app/shared/hooks";
import type { Invoice } from "@app/shared/schemas/api";

import { useInvoiceHandlers } from "./use-invoice-handlers";

export function useInvoiceDetail(invoiceId: string, invoice: Invoice | undefined) {
  const { addRecentItem } = useRecentItems();
  const [sendDialogOpen, setSendDialogOpen] = React.useState(false);
  const [markPaidDialogOpen, setMarkPaidDialogOpen] = React.useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = React.useState(false);
  const [auditLogExpanded, setAuditLogExpanded] = React.useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = React.useState(false);
  const [paymentsExpanded, setPaymentsExpanded] = React.useState(true);

  React.useEffect(() => {
    if (invoice) {
      addRecentItem({
        id: invoice.id,
        type: "invoice",
        label: `#${invoice.publicId}`,
        href: `/app/invoices/${invoice.id}`,
      });
    }
  }, [invoice, addRecentItem]);

  const handlers = useInvoiceHandlers(invoiceId, invoice, {
    closeSendDialog: () => setSendDialogOpen(false),
    closeMarkPaidDialog: () => setMarkPaidDialogOpen(false),
    closePaymentDialog: () => setPaymentDialogOpen(false),
  });

  return {
    sendDialogOpen,
    setSendDialogOpen,
    markPaidDialogOpen,
    setMarkPaidDialogOpen,
    previewDialogOpen,
    setPreviewDialogOpen,
    auditLogExpanded,
    setAuditLogExpanded,
    paymentDialogOpen,
    setPaymentDialogOpen,
    paymentsExpanded,
    setPaymentsExpanded,
    ...handlers,
  };
}
