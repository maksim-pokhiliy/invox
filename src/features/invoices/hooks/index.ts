"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys, STALE_TIME } from "@app/shared/config/query";
import { INVOICE_STATUS } from "@app/shared/config/invoice-status";
import { invoicesApi, type RecordPaymentInput } from "../api";
import type { CreateInvoiceInput, UpdateInvoiceInput } from "@app/shared/schemas";
import type { Invoice, InvoiceListItem } from "@app/shared/schemas/api";

export function useInvoices() {
  return useQuery({
    queryKey: queryKeys.invoices,
    queryFn: invoicesApi.list,
    staleTime: STALE_TIME.short,
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: queryKeys.invoice(id),
    queryFn: () => invoicesApi.get(id),
    staleTime: STALE_TIME.medium,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInvoiceInput) => invoicesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInvoiceInput }) =>
      invoicesApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoice(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
    },
  });
}

export function useSendInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => invoicesApi.send(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.invoices });
      await queryClient.cancelQueries({ queryKey: queryKeys.invoice(id) });

      const previousInvoices = queryClient.getQueryData<InvoiceListItem[]>(queryKeys.invoices);
      const previousInvoice = queryClient.getQueryData<Invoice>(queryKeys.invoice(id));

      queryClient.setQueryData<InvoiceListItem[]>(queryKeys.invoices, (old) =>
        old?.map((invoice) =>
          invoice.id === id
            ? { ...invoice, status: INVOICE_STATUS.SENT, sentAt: new Date().toISOString() }
            : invoice
        )
      );

      queryClient.setQueryData<Invoice>(queryKeys.invoice(id), (old) =>
        old ? { ...old, status: INVOICE_STATUS.SENT, sentAt: new Date().toISOString() } : old
      );

      return { previousInvoices, previousInvoice };
    },
    onError: (_, id, context) => {
      if (context?.previousInvoices) {
        queryClient.setQueryData(queryKeys.invoices, context.previousInvoices);
      }
      if (context?.previousInvoice) {
        queryClient.setQueryData(queryKeys.invoice(id), context.previousInvoice);
      }
    },
    onSettled: (_, __, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoice(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
    },
  });
}

export function useMarkInvoicePaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => invoicesApi.markPaid(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.invoices });
      await queryClient.cancelQueries({ queryKey: queryKeys.invoice(id) });

      const previousInvoices = queryClient.getQueryData<InvoiceListItem[]>(queryKeys.invoices);
      const previousInvoice = queryClient.getQueryData<Invoice>(queryKeys.invoice(id));

      queryClient.setQueryData<InvoiceListItem[]>(queryKeys.invoices, (old) =>
        old?.map((invoice) =>
          invoice.id === id
            ? { ...invoice, status: INVOICE_STATUS.PAID, paidAt: new Date().toISOString() }
            : invoice
        )
      );

      queryClient.setQueryData<Invoice>(queryKeys.invoice(id), (old) =>
        old ? { ...old, status: INVOICE_STATUS.PAID, paidAt: new Date().toISOString() } : old
      );

      return { previousInvoices, previousInvoice };
    },
    onError: (_, id, context) => {
      if (context?.previousInvoices) {
        queryClient.setQueryData(queryKeys.invoices, context.previousInvoices);
      }
      if (context?.previousInvoice) {
        queryClient.setQueryData(queryKeys.invoice(id), context.previousInvoice);
      }
    },
    onSettled: (_, __, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoice(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => invoicesApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.invoices });
      const previousInvoices = queryClient.getQueryData<InvoiceListItem[]>(queryKeys.invoices);
      queryClient.setQueryData<InvoiceListItem[]>(queryKeys.invoices, (old) =>
        old?.filter((invoice) => invoice.id !== id)
      );
      return { previousInvoices };
    },
    onError: (_, __, context) => {
      if (context?.previousInvoices) {
        queryClient.setQueryData(queryKeys.invoices, context.previousInvoices);
      }
    },
    onSettled: (_, __, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.invoice(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
    },
  });
}

export function useDuplicateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => invoicesApi.duplicate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
    },
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ invoiceId, data }: { invoiceId: string; data: RecordPaymentInput }) =>
      invoicesApi.recordPayment(invoiceId, data),
    onSuccess: (_, { invoiceId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoice(invoiceId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics });
    },
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ invoiceId, paymentId }: { invoiceId: string; paymentId: string }) =>
      invoicesApi.deletePayment(invoiceId, paymentId),
    onSuccess: (_, { invoiceId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoice(invoiceId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics });
    },
  });
}

export function usePrefetchInvoice() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.invoice(id),
      queryFn: () => invoicesApi.get(id),
      staleTime: STALE_TIME.medium,
    });
  };
}

export function usePrefetchInvoices() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.invoices,
      queryFn: invoicesApi.list,
      staleTime: STALE_TIME.short,
    });
  };
}
