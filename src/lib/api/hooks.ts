"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientsApi, invoicesApi, senderProfileApi, publicApi } from "./client";
import type { CreateClientInput, UpdateClientInput } from "@app/shared/schemas/client";
import type { CreateInvoiceInput, UpdateInvoiceInput } from "@app/shared/schemas/invoice";
import type { SenderProfileInput } from "@app/shared/schemas/sender-profile";

// Query keys for cache management
export const queryKeys = {
  clients: ["clients"] as const,
  invoices: ["invoices"] as const,
  invoice: (id: string) => ["invoice", id] as const,
  senderProfile: ["sender-profile"] as const,
  publicInvoice: (publicId: string) => ["public-invoice", publicId] as const,
};

// Clients hooks
export function useClients() {
  return useQuery({
    queryKey: queryKeys.clients,
    queryFn: clientsApi.list,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients });
    },
  });
}

// Invoices hooks
export function useInvoices() {
  return useQuery({
    queryKey: queryKeys.invoices,
    queryFn: invoicesApi.list,
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: queryKeys.invoice(id),
    queryFn: () => invoicesApi.get(id),
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
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoice(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
    },
  });
}

export function useMarkInvoicePaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => invoicesApi.markPaid(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoice(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => invoicesApi.delete(id),
    onSuccess: (_, id) => {
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
