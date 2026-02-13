"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys, STALE_TIME } from "@app/shared/config/query";
import type { CreateTemplateInput, Template, UpdateTemplateInput } from "@app/shared/schemas";

import { templatesApi } from "../api";

export function useTemplates() {
  return useQuery({
    queryKey: queryKeys.templates,
    queryFn: templatesApi.list,
    staleTime: STALE_TIME.medium,
  });
}

export function useTemplate(id: string) {
  return useQuery({
    queryKey: queryKeys.template(id),
    queryFn: () => templatesApi.get(id),
    enabled: !!id,
    staleTime: STALE_TIME.medium,
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTemplateInput) => templatesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.templates });
    },
  });
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTemplateInput }) =>
      templatesApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.template(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.templates });
    },
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => templatesApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.templates });
      const previousTemplates = queryClient.getQueryData<Template[]>(queryKeys.templates);

      queryClient.setQueryData<Template[]>(queryKeys.templates, (old) =>
        old?.filter((template) => template.id !== id)
      );

      return { previousTemplates };
    },
    onError: (_, __, context) => {
      if (context?.previousTemplates) {
        queryClient.setQueryData(queryKeys.templates, context.previousTemplates);
      }
    },
    onSettled: (_, __, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.template(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.templates });
    },
  });
}
