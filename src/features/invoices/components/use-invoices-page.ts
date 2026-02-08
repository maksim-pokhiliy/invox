"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@app/shared/ui/toast";
import { useConfirmDialog } from "@app/shared/ui/confirm-dialog";
import { useAnnounce } from "@app/shared/ui/screen-reader-announcer";
import {
  useInvoices,
  useDeleteInvoice,
  useDuplicateInvoice,
  usePrefetchInvoice,
} from "@app/features/invoices";
import { exportInvoicesToCSV } from "@app/shared/lib/export";
import { useVirtualList } from "@app/shared/hooks";
import { useInvoicesFiltering, useInvoicesPagination } from "./use-invoices-filtering";
import { useInvoiceSelection, useInvoiceMenuActions, useBulkActions } from "./use-invoices-actions";

export function useInvoicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const { confirm, dialogProps } = useConfirmDialog();
  const announce = useAnnounce();

  const { data: invoices, isLoading, error } = useInvoices();
  const deleteMutation = useDeleteInvoice();
  const duplicateMutation = useDuplicateInvoice();
  const prefetchInvoice = usePrefetchInvoice();

  const initialStatus = searchParams.get("status") || "ALL";
  const [filterDrawerOpen, setFilterDrawerOpen] = React.useState(false);

  const filtering = useInvoicesFiltering(invoices, initialStatus);

  React.useEffect(() => {
    if (filtering.debouncedSearch || filtering.statusFilter !== "ALL") {
      announce(
        `${filtering.filteredInvoices.length} invoice${filtering.filteredInvoices.length !== 1 ? "s" : ""} found`
      );
    }
  }, [
    filtering.filteredInvoices.length,
    filtering.debouncedSearch,
    filtering.statusFilter,
    announce,
  ]);

  const pagination = useInvoicesPagination(
    filtering.filteredInvoices,
    filtering.debouncedSearch,
    filtering.statusFilter
  );

  const { parentRef, virtualItems, totalSize } = useVirtualList({
    items: filtering.filteredInvoices,
    estimateSize: 65,
    overscan: 10,
  });

  const selection = useInvoiceSelection(filtering.filteredInvoices, announce);

  const menuActions = useInvoiceMenuActions(
    invoices,
    confirm,
    toast,
    router,
    deleteMutation,
    duplicateMutation
  );

  const bulkActions = useBulkActions(
    selection.selectedIds,
    selection.setSelectedIds,
    filtering.filteredInvoices,
    confirm,
    toast
  );

  const handleExportCSV = () => {
    if (!filtering.filteredInvoices.length) {
      toast.error("No invoices to export");
      return;
    }
    exportInvoicesToCSV(filtering.filteredInvoices);
    toast.success(`Exported ${filtering.filteredInvoices.length} invoices`);
  };

  const handleClearFilters = () => {
    filtering.setSearchQuery("");
    filtering.setStatusFilter("ALL");
  };

  const navigateToNew = () => router.push("/app/invoices/new");
  const navigateToInvoice = (id: string) => router.push(`/app/invoices/${id}`);

  return {
    invoices,
    isLoading,
    error,
    ...filtering,
    ...pagination,
    ...selection,
    ...menuActions,
    ...bulkActions,
    filterDrawerOpen,
    setFilterDrawerOpen,
    parentRef,
    virtualItems,
    totalSize,
    prefetchInvoice,
    dialogProps,
    handleExportCSV,
    handleClearFilters,
    navigateToNew,
    navigateToInvoice,
  };
}
