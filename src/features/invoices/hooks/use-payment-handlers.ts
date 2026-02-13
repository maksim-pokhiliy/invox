"use client";

import { ApiError } from "@app/shared/api";
import { useConfirmDialog } from "@app/shared/hooks/use-confirm-dialog";
import { useToast } from "@app/shared/hooks/use-toast";

import { useDeletePayment, useMarkInvoicePaid, useRecordPayment } from ".";

interface PaymentDialogControls {
  closeMarkPaidDialog: () => void;
  closePaymentDialog: () => void;
}

export function usePaymentHandlers(
  invoiceId: string,
  toast: ReturnType<typeof useToast>,
  confirm: ReturnType<typeof useConfirmDialog>["confirm"],
  controls: PaymentDialogControls
) {
  const markPaidMutation = useMarkInvoicePaid();
  const recordPaymentMutation = useRecordPayment();
  const deletePaymentMutation = useDeletePayment();

  const handleMarkPaid = () => {
    markPaidMutation.mutate(invoiceId, {
      onSuccess: () => {
        controls.closeMarkPaidDialog();
        toast.success("Invoice marked as paid!", "Payment Recorded");
      },
      onError: (err) => {
        toast.error(err instanceof ApiError ? err.message : "Failed to mark as paid");
      },
    });
  };

  const handleRecordPayment = (amount: string, note: string) => {
    const amountInCents = Math.round(parseFloat(amount) * 100);

    if (isNaN(amountInCents) || amountInCents <= 0) {
      toast.error("Please enter a valid amount");

      return;
    }

    recordPaymentMutation.mutate(
      { invoiceId, data: { amount: amountInCents, method: "MANUAL", note: note || undefined } },
      {
        onSuccess: () => {
          controls.closePaymentDialog();
          toast.success("Payment recorded successfully!");
        },
        onError: (err) => {
          toast.error(err instanceof ApiError ? err.message : "Failed to record payment");
        },
      }
    );
  };

  const handleDeletePayment = (paymentId: string) => {
    confirm({
      title: "Delete Payment",
      message: "Are you sure you want to delete this payment? This action cannot be undone.",
      confirmText: "Delete",
      confirmColor: "error",
      onConfirm: async () => {
        await deletePaymentMutation.mutateAsync({ invoiceId, paymentId });
        toast.success("Payment deleted");
      },
    });
  };

  return {
    handleMarkPaid,
    handleRecordPayment,
    handleDeletePayment,
    markPaidMutation,
    recordPaymentMutation,
  };
}
