"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys, STALE_TIME } from "@app/shared/config/query";
import type {
  CreateRecurringInput,
  RecurringInvoice,
  UpdateRecurringInput,
} from "@app/shared/schemas";

import { recurringApi } from "../api";

export function useRecurringInvoices() {
  return useQuery({
    queryKey: queryKeys.recurring,
    queryFn: recurringApi.list,
    staleTime: STALE_TIME.medium,
  });
}

export function useRecurringInvoice(id: string) {
  return useQuery({
    queryKey: queryKeys.recurringItem(id),
    queryFn: () => recurringApi.get(id),
    enabled: !!id,
    staleTime: STALE_TIME.medium,
  });
}

export function useCreateRecurring() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRecurringInput) => recurringApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recurring });
    },
  });
}

export function useUpdateRecurring() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRecurringInput }) =>
      recurringApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recurringItem(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.recurring });
    },
  });
}

export function useDeleteRecurring() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => recurringApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.recurring });
      const previous = queryClient.getQueryData<RecurringInvoice[]>(queryKeys.recurring);

      queryClient.setQueryData<RecurringInvoice[]>(queryKeys.recurring, (old) =>
        old?.filter((r) => r.id !== id)
      );

      return { previous };
    },
    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.recurring, context.previous);
      }
    },
    onSettled: (_, __, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.recurringItem(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.recurring });
    },
  });
}

export function useGenerateFromRecurring() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => recurringApi.generate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recurringItem(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.recurring });
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
    },
  });
}
