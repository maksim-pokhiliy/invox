"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { ApiError } from "@app/shared/api";
import type { InvoiceFormInput } from "@app/shared/schemas";
import { useToast } from "@app/shared/ui/toast";

import { useCreateInvoice, useUpdateInvoice } from "@app/features/invoices";

interface UseInvoiceSubmitOptions {
  mode: "create" | "edit";
  invoiceId?: string;
  onDraftClear: () => void;
}

function transformForSubmit(data: InvoiceFormInput) {
  const items = data.items.map((item, i) => ({
    ...item,
    unitPrice: Math.round(item.unitPrice * 100),
    sortOrder: i,
  }));

  const itemGroups = data.itemGroups?.length
    ? data.itemGroups.map((group, gi) => ({
        ...group,
        sortOrder: gi,
        items: group.items.map((item, ii) => ({
          ...item,
          unitPrice: Math.round(item.unitPrice * 100),
          sortOrder: ii,
        })),
      }))
    : undefined;

  return { items, itemGroups };
}

export function useInvoiceSubmit({ mode, invoiceId, onDraftClear }: UseInvoiceSubmitOptions) {
  const router = useRouter();
  const toast = useToast();
  const [error, setError] = React.useState<string | null>(null);

  const createMutation = useCreateInvoice();
  const updateMutation = useUpdateInvoice();

  const isPending = mode === "create" ? createMutation.isPending : updateMutation.isPending;

  const onSubmit = React.useCallback(
    (data: InvoiceFormInput) => {
      setError(null);
      const { items, itemGroups } = transformForSubmit(data);

      if (mode === "create") {
        createMutation.mutate(
          {
            clientId: data.clientId,
            currency: data.currency,
            dueDate: new Date(data.dueDate),
            items,
            itemGroups,
            notes: data.notes || undefined,
          },
          {
            onSuccess: (invoice) => {
              onDraftClear();
              toast.success("Invoice created successfully!");
              router.push(`/app/invoices/${invoice.id}`);
            },
            onError: (err) => {
              const message = err instanceof ApiError ? err.message : "Failed to create invoice";

              setError(message);
              toast.error(message);
            },
          }
        );

        return;
      }

      if (!invoiceId) {
        setError("Invoice ID is required for editing");

        return;
      }

      updateMutation.mutate(
        {
          id: invoiceId,
          data: {
            clientId: data.clientId,
            currency: data.currency,
            dueDate: new Date(data.dueDate),
            items,
            itemGroups,
            notes: data.notes || null,
          },
        },
        {
          onSuccess: () => {
            toast.success("Invoice updated successfully!");
            router.push(`/app/invoices/${invoiceId}`);
          },
          onError: (err) => {
            const message = err instanceof ApiError ? err.message : "Failed to update invoice";

            setError(message);
            toast.error(message);
          },
        }
      );
    },
    [mode, invoiceId, createMutation, updateMutation, onDraftClear, toast, router]
  );

  return { error, isPending, onSubmit };
}
