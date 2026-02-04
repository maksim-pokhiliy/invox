"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientsApi, invoicesApi, senderProfileApi, publicApi } from "./client";
import type { CreateClientInput, UpdateClientInput } from "@app/shared/schemas/client";
import type { CreateInvoiceInput, UpdateInvoiceInput } from "@app/shared/schemas/invoice";
import type { SenderProfileInput } from "@app/shared/schemas/sender-profile";
import type { Client, InvoiceListItem, Invoice } from "@app/shared/schemas/api";

// Query keys for cache management
export const queryKeys = {
  clients: ["clients"] as const,
  invoices: ["invoices"] as const,
  invoice: (id: string) => ["invoice", id] as const,
  senderProfile: ["sender-profile"] as const,
  publicInvoice: (publicId: string) => ["public-invoice", publicId] as const,
};

// Stale time constants
const STALE_TIME = {
  short: 30 * 1000, // 30 seconds
  medium: 60 * 1000, // 1 minute
  long: 5 * 60 * 1000, // 5 minutes
} as const;

// Clients hooks
export function useClients() {
  return useQuery({
    queryKey: queryKeys.clients,
    queryFn: clientsApi.list,
    staleTime: STALE_TIME.medium,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClientInput) => clientsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClientInput }) =>
      clientsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients });
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => clientsApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.clients });
      const previousClients = queryClient.getQueryData<Client[]>(queryKeys.clients);
      queryClient.setQueryData<Client[]>(queryKeys.clients, (old) =>
        old?.filter((client) => client.id !== id)
      );
      return { previousClients };
    },
    onError: (_, __, context) => {
      if (context?.previousClients) {
        queryClient.setQueryData(queryKeys.clients, context.previousClients);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients });
    },
  });
}

// Invoices hooks
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
            ? { ...invoice, status: "SENT" as const, sentAt: new Date().toISOString() }
            : invoice
        )
      );

      queryClient.setQueryData<Invoice>(queryKeys.invoice(id), (old) =>
        old ? { ...old, status: "SENT" as const, sentAt: new Date().toISOString() } : old
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
            ? { ...invoice, status: "PAID" as const, paidAt: new Date().toISOString() }
            : invoice
        )
      );

      queryClient.setQueryData<Invoice>(queryKeys.invoice(id), (old) =>
        old ? { ...old, status: "PAID" as const, paidAt: new Date().toISOString() } : old
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

// Sender Profile hooks
export function useSenderProfile() {
  return useQuery({
    queryKey: queryKeys.senderProfile,
    queryFn: senderProfileApi.get,
    staleTime: STALE_TIME.long,
  });
}

export function useCreateSenderProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SenderProfileInput) => senderProfileApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.senderProfile });
    },
  });
}

export function useUpdateSenderProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SenderProfileInput) => senderProfileApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.senderProfile });
    },
  });
}

// Public invoice hooks
export function usePublicInvoice(publicId: string) {
  return useQuery({
    queryKey: queryKeys.publicInvoice(publicId),
    queryFn: () => publicApi.getInvoice(publicId),
    staleTime: STALE_TIME.medium,
  });
}

export function useMarkInvoiceViewed() {
  return useMutation({
    mutationFn: (publicId: string) => publicApi.markViewed(publicId),
  });
}

export function useCreateCheckoutSession() {
  return useMutation({
    mutationFn: (invoiceId: string) => publicApi.createCheckoutSession(invoiceId),
  });
}

// Prefetch hooks for data loading optimization
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

export function usePrefetchClients() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.clients,
      queryFn: clientsApi.list,
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

export function usePrefetchSenderProfile() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.senderProfile,
      queryFn: senderProfileApi.get,
      staleTime: STALE_TIME.long,
    });
  };
}
