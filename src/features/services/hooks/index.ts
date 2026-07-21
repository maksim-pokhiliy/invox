"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys, STALE_TIME } from "@app/shared/config/query";
import type { CreateServiceInput, UpdateServiceInput } from "@app/shared/schemas";
import type { Service } from "@app/shared/schemas/api";

import { servicesApi } from "../api";

export function useServices() {
  return useQuery({
    queryKey: queryKeys.services,
    queryFn: servicesApi.list,
    staleTime: STALE_TIME.medium,
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateServiceInput) => servicesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services });
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateServiceInput }) =>
      servicesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => servicesApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.services });
      const previousServices = queryClient.getQueryData<Service[]>(queryKeys.services);

      queryClient.setQueryData<Service[]>(queryKeys.services, (old) =>
        old?.filter((service) => service.id !== id)
      );

      return { previousServices };
    },
    onError: (_, __, context) => {
      if (context?.previousServices) {
        queryClient.setQueryData(queryKeys.services, context.previousServices);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services });
    },
  });
}

export function usePrefetchServices() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.services,
      queryFn: servicesApi.list,
      staleTime: STALE_TIME.medium,
    });
  };
}
