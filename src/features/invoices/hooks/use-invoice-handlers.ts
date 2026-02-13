"use client";

import { useRouter } from "next/navigation";

import { ApiError } from "@app/shared/api";
import { useConfirmDialog } from "@app/shared/hooks/use-confirm-dialog";
import { useToast } from "@app/shared/hooks/use-toast";
import { generateInvoicePdf } from "@app/shared/lib/export";
import type { Invoice } from "@app/shared/schemas/api";

import { useDeleteInvoice, useDuplicateInvoice, useSendInvoice } from "@app/features/invoices";

import { usePaymentHandlers } from "./use-payment-handlers";

interface DialogControls {
  closeSendDialog: () => void;
  closeMarkPaidDialog: () => void;
  closePaymentDialog: () => void;
}

export function useInvoiceHandlers(
  invoiceId: string,
  invoice: Invoice | undefined,
  controls: DialogControls
) {
  const router = useRouter();
  const toast = useToast();
  const { confirm, dialogProps } = useConfirmDialog();
  const sendMutation = useSendInvoice();
  const deleteMutation = useDeleteInvoice();
  const duplicateMutation = useDuplicateInvoice();

  const paymentHandlers = usePaymentHandlers(invoiceId, toast, confirm, controls);

  const handleSendInvoice = () => {
    sendMutation.mutate(invoiceId, {
      onSuccess: () => {
        controls.closeSendDialog();
        toast.success("Invoice sent successfully!", "Email Sent");
      },
      onError: (err) => {
        toast.error(err instanceof ApiError ? err.message : "Failed to send invoice");
      },
    });
  };

  const copyPublicLink = () => {
    if (!invoice) {
      return;
    }

    const url = `${window.location.origin}/i/${invoice.publicId}`;

    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  const handleDelete = () => {
    confirm({
      title: "Delete Invoice",
      message: `Are you sure you want to delete invoice #${invoice?.publicId}? This action cannot be undone.`,
      confirmText: "Delete",
      confirmColor: "error",
      onConfirm: async () => {
        await deleteMutation.mutateAsync(invoiceId);
        toast.success("Invoice deleted successfully");
        router.push("/app/invoices");
      },
    });
  };

  const handleDuplicate = () => {
    duplicateMutation.mutate(invoiceId, {
      onSuccess: (newInvoice) => {
        toast.success("Invoice duplicated successfully");
        router.push(`/app/invoices/${newInvoice.id}`);
      },
      onError: (err) => {
        toast.error(err instanceof ApiError ? err.message : "Failed to duplicate invoice");
      },
    });
  };

  const handleDownloadPdf = () => {
    if (!invoice) {
      return;
    }

    generateInvoicePdf({ ...invoice, sender: null });
    toast.success("PDF downloaded!");
  };

  return {
    handleSendInvoice,
    copyPublicLink,
    handleDelete,
    handleDuplicate,
    handleDownloadPdf,
    sendMutation,
    duplicateMutation,
    dialogProps,
    ...paymentHandlers,
  };
}
