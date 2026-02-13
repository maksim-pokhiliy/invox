"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@app/shared/api";
import { queryKeys } from "@app/shared/config/query";
import { useConfirmDialog } from "@app/shared/hooks/use-confirm-dialog";
import { useToast } from "@app/shared/hooks/use-toast";
import { exportInvoicesToCSV } from "@app/shared/lib/export";
import type { InvoiceListItem } from "@app/shared/schemas/api";

import { invoicesApi, useDeleteInvoice, useDuplicateInvoice } from "@app/features/invoices";

export function useInvoiceSelection(
  filteredInvoices: InvoiceListItem[],
  announce: (msg: string) => void
) {
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    if (selectedIds.size > 0) {
      announce(`${selectedIds.size} invoice${selectedIds.size !== 1 ? "s" : ""} selected`);
    }
  }, [selectedIds.size, announce]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const handleToggleSelectAll = () => {
    const visibleIds = filteredInvoices.map((inv) => inv.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));

    setSelectedIds(allSelected ? new Set() : new Set(visibleIds));
  };

  const clearSelection = () => setSelectedIds(new Set());

  return { selectedIds, setSelectedIds, handleToggleSelect, handleToggleSelectAll, clearSelection };
}

export function useInvoiceMenuActions(
  invoices: InvoiceListItem[] | undefined,
  confirm: ReturnType<typeof useConfirmDialog>["confirm"],
  toast: ReturnType<typeof useToast>,
  router: ReturnType<typeof useRouter>,
  deleteMutation: ReturnType<typeof useDeleteInvoice>,
  duplicateMutation: ReturnType<typeof useDuplicateInvoice>
) {
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = React.useState<string | null>(null);

  const selectedInvoice = invoices?.find((inv) => inv.id === selectedInvoiceId);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, invoiceId: string) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedInvoiceId(invoiceId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedInvoiceId(null);
  };

  const handleDelete = () => {
    if (!selectedInvoice) {
      return;
    }

    handleMenuClose();
    confirm({
      title: "Delete Invoice",
      message: `Are you sure you want to delete invoice #${selectedInvoice.publicId}? This action cannot be undone.`,
      confirmText: "Delete",
      confirmColor: "error",
      onConfirm: async () => {
        await deleteMutation.mutateAsync(selectedInvoice.id);
        toast.success("Invoice deleted successfully");
      },
    });
  };

  const handleDuplicate = () => {
    if (!selectedInvoice) {
      return;
    }

    handleMenuClose();
    duplicateMutation.mutate(selectedInvoice.id, {
      onSuccess: (newInvoice) => {
        toast.success("Invoice duplicated successfully");
        router.push(`/app/invoices/${newInvoice.id}`);
      },
      onError: (err) => {
        toast.error(err instanceof ApiError ? err.message : "Failed to duplicate invoice");
      },
    });
  };

  const handleViewDetails = () => {
    if (!selectedInvoice) {
      return;
    }

    handleMenuClose();
    router.push(`/app/invoices/${selectedInvoice.id}`);
  };

  const handleEdit = () => {
    if (!selectedInvoice) {
      return;
    }

    handleMenuClose();
    router.push(`/app/invoices/${selectedInvoice.id}/edit`);
  };

  return {
    menuAnchorEl,
    selectedInvoice,
    handleMenuOpen,
    handleMenuClose,
    handleDelete,
    handleDuplicate,
    handleViewDetails,
    handleEdit,
  };
}

export function useBulkActions(
  selectedIds: Set<string>,
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>,
  filteredInvoices: InvoiceListItem[],
  confirm: ReturnType<typeof useConfirmDialog>["confirm"],
  toast: ReturnType<typeof useToast>
) {
  const [bulkProcessing, setBulkProcessing] = React.useState(false);
  const queryClient = useQueryClient();

  const runBulkAction = async (
    fn: (id: string) => Promise<unknown>,
    successMsg: string,
    errorMsg: string
  ) => {
    setBulkProcessing(true);

    try {
      await Promise.all([...selectedIds].map(fn));
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
      toast.success(successMsg);
      setSelectedIds(new Set());
    } catch {
      toast.error(errorMsg);
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleBulkDelete = () => {
    confirm({
      title: "Delete Invoices",
      message: `Are you sure you want to delete ${selectedIds.size} invoice(s)? This action cannot be undone.`,
      confirmText: "Delete All",
      confirmColor: "error",
      onConfirm: () =>
        runBulkAction(
          invoicesApi.delete,
          `${selectedIds.size} invoice(s) deleted`,
          "Some invoices could not be deleted"
        ),
    });
  };

  const handleBulkExport = () => {
    const selected = filteredInvoices.filter((inv) => selectedIds.has(inv.id));

    exportInvoicesToCSV(selected);
    toast.success(`Exported ${selected.length} invoices`);
  };

  const handleBulkMarkPaid = () =>
    runBulkAction(
      invoicesApi.markPaid,
      `${selectedIds.size} invoice(s) marked as paid`,
      "Some invoices could not be marked as paid"
    );

  const handleBulkSend = () =>
    runBulkAction(
      invoicesApi.send,
      `${selectedIds.size} invoice(s) sent`,
      "Some invoices could not be sent"
    );

  return { bulkProcessing, handleBulkDelete, handleBulkExport, handleBulkMarkPaid, handleBulkSend };
}
