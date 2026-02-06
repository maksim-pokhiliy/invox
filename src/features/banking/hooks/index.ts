"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys, STALE_TIME } from "@app/shared/config/query";
import { bankingApi } from "../api";

export function useConnections() {
  return useQuery({
    queryKey: queryKeys.bankConnections,
    queryFn: bankingApi.getConnections,
    staleTime: STALE_TIME.medium,
  });
}

export function useCreateConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (returnUrl?: string) => bankingApi.createConnectSession(returnUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bankConnections });
    },
  });
}

export function useDeleteConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bankingApi.deleteConnection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bankConnections });
    },
  });
}

export function useSyncConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bankingApi.syncConnection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bankConnections });
      queryClient.invalidateQueries({ queryKey: queryKeys.bankTransactions });
    },
  });
}

export function usePendingTransactions() {
  return useQuery({
    queryKey: queryKeys.bankTransactions,
    queryFn: bankingApi.getTransactions,
    staleTime: STALE_TIME.short,
  });
}

export function useConfirmMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ transactionId, invoiceId }: { transactionId: string; invoiceId: string }) =>
      bankingApi.confirmMatch(transactionId, invoiceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bankTransactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
    },
  });
}

export function useIgnoreTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transactionId: string) => bankingApi.ignoreTransaction(transactionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bankTransactions });
    },
  });
}

export function useCompleteConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => bankingApi.completeConnection(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bankConnections });
      queryClient.invalidateQueries({ queryKey: queryKeys.bankTransactions });
    },
  });
}
