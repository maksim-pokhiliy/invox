"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@app/shared/ui/toast";
import { useConfirmDialog } from "@app/shared/ui/confirm-dialog";
import {
  useRecurringInvoices,
  useUpdateRecurring,
  useGenerateFromRecurring,
  recurringApi,
  type RecurringInvoice,
  type RecurringStatus,
} from "@app/features/recurring";
import { useOptimisticDelete, useDebouncedValue } from "@app/shared/hooks";
import { calculateTotals, buildDiscountInput } from "@app/shared/lib/calculations";
import { useAnnounce } from "@app/shared/ui/screen-reader-announcer";
import { queryKeys } from "@app/shared/config/query";
import { PAGINATION, SEARCH } from "@app/shared/config/config";
import { ApiError } from "@app/shared/api";

function useRecurringFiltering(recurring: RecurringInvoice[] | undefined, pendingIds: Set<string>) {
  const announce = useAnnounce();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(PAGINATION.DEFAULT_PAGE_SIZE);

  const debouncedSearch = useDebouncedValue(searchQuery, SEARCH.DEBOUNCE_MS);

  const filteredRecurring = React.useMemo(() => {
    if (!recurring) {
      return [];
    }
    return recurring.filter((item) => {
      if (pendingIds.has(item.id)) {
        return false;
      }
      if (debouncedSearch === "") {
        return true;
      }
      const query = debouncedSearch.toLowerCase();
      return (
        item.name.toLowerCase().includes(query) ||
        item.client.name.toLowerCase().includes(query) ||
        item.client.email.toLowerCase().includes(query)
      );
    });
  }, [recurring, pendingIds, debouncedSearch]);

  React.useEffect(() => {
    setPage(0);
  }, [debouncedSearch]);

  React.useEffect(() => {
    if (debouncedSearch) {
      announce(
        `${filteredRecurring.length} recurring invoice${filteredRecurring.length !== 1 ? "s" : ""} found`
      );
    }
  }, [filteredRecurring.length, debouncedSearch, announce]);

  const handlePageChange = React.useCallback((_event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleRowsPerPageChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    },
    []
  );

  return {
    searchQuery,
    setSearchQuery,
    filteredRecurring,
    page,
    rowsPerPage,
    handlePageChange,
    handleRowsPerPageChange,
  };
}

function useRecurringActions(selectedItem: RecurringInvoice | null, handleMenuClose: () => void) {
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

const calculateTotal = (item: RecurringInvoice) => {
  const { total } = calculateTotals(
    item.items,
    buildDiscountInput(item.discountType, item.discountValue),
    item.taxRate
  );
  return total;
};

export function useRecurringPage() {
  const { data: recurring, isLoading } = useRecurringInvoices();
  const { deleteItem, pendingIds } = useOptimisticDelete<RecurringInvoice>({
    queryKey: queryKeys.recurring,
    getId: (item) => item.id,
    entityName: "Recurring invoice",
    deleteFn: recurringApi.delete,
  });

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = React.useState<RecurringInvoice | null>(null);

  const handleMenuOpen = React.useCallback(
    (event: React.MouseEvent<HTMLElement>, item: RecurringInvoice) => {
      setAnchorEl(event.currentTarget);
      setSelectedItem(item);
    },
    []
  );

  const handleMenuClose = React.useCallback(() => {
    setAnchorEl(null);
  }, []);

  const filtering = useRecurringFiltering(recurring, pendingIds);
  const actions = useRecurringActions(selectedItem, handleMenuClose);

  const handleDelete = React.useCallback(() => {
    if (!selectedItem) {
      return;
    }
    const item = selectedItem;
    handleMenuClose();
    deleteItem(item);
  }, [selectedItem, handleMenuClose, deleteItem]);

  return {
    router: actions.router,
    recurring,
    isLoading,
    anchorEl,
    selectedItem,
    handleMenuOpen,
    handleMenuClose,
    handleToggleStatus: actions.handleToggleStatus,
    handleGenerateNow: actions.handleGenerateNow,
    handleDelete,
    calculateTotal,
    dialogProps: actions.dialogProps,
    ...filtering,
  };
}
