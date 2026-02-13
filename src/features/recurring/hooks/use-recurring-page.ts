"use client";

import * as React from "react";

import { queryKeys } from "@app/shared/config/query";
import { useOptimisticDelete } from "@app/shared/hooks";
import type { RecurringInvoice } from "@app/shared/schemas";

import { recurringApi, useRecurringInvoices } from "..";
import { calculateRecurringTotal, useRecurringActions } from "./use-recurring-actions";
import { useRecurringFiltering } from "./use-recurring-filtering";

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
    calculateTotal: calculateRecurringTotal,
    dialogProps: actions.dialogProps,
    ...filtering,
  };
}
