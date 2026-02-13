"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { ApiError } from "@app/shared/api";
import { useConfirmDialog } from "@app/shared/hooks/use-confirm-dialog";
import { useToast } from "@app/shared/hooks/use-toast";
import { buildDiscountInput, calculateTotals } from "@app/shared/lib/calculations";
import type { RecurringInvoice, RecurringStatus } from "@app/shared/schemas";

import { useGenerateFromRecurring, useUpdateRecurring } from "..";

export function useRecurringActions(
  selectedItem: RecurringInvoice | null,
  handleMenuClose: () => void
) {
  const router = useRouter();
  const toast = useToast();
  const { confirm, dialogProps } = useConfirmDialog();
  const updateMutation = useUpdateRecurring();
  const generateMutation = useGenerateFromRecurring();

  const handleToggleStatus = React.useCallback(() => {
    if (!selectedItem) {
      return;
    }

    const item = selectedItem;
    const newStatus: RecurringStatus = item.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
    const action = newStatus === "PAUSED" ? "pause" : "activate";

    handleMenuClose();
    confirm({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Recurring Invoice`,
      message: `Are you sure you want to ${action} "${item.name}"?`,
      confirmText: action.charAt(0).toUpperCase() + action.slice(1),
      onConfirm: async () => {
        try {
          await updateMutation.mutateAsync({ id: item.id, data: { status: newStatus } });
          toast.success(`Recurring invoice ${newStatus === "ACTIVE" ? "activated" : "paused"}`);
        } catch (err) {
          toast.error(err instanceof ApiError ? err.message : "Failed to update status");
        }
      },
    });
  }, [selectedItem, handleMenuClose, confirm, updateMutation, toast]);

  const handleGenerateNow = React.useCallback(() => {
    if (!selectedItem) {
      return;
    }

    generateMutation.mutate(selectedItem.id, {
      onSuccess: (data) => {
        toast.success("Invoice generated successfully");
        router.push(`/app/invoices/${data.invoiceId}`);
      },
      onError: (err) => {
        toast.error(err instanceof ApiError ? err.message : "Failed to generate invoice");
      },
    });
    handleMenuClose();
  }, [selectedItem, generateMutation, toast, router, handleMenuClose]);

  return { router, confirm, dialogProps, handleToggleStatus, handleGenerateNow };
}

export function calculateRecurringTotal(item: RecurringInvoice) {
  const { total } = calculateTotals(
    item.items,
    buildDiscountInput(item.discountType, item.discountValue),
    item.taxRate
  );

  return total;
}
