"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys, STALE_TIME } from "@app/shared/config/query";

import type { WaitlistEntry } from "../api";
import { waitlistAdminApi } from "../api";

export function useWaitlistEntries() {
  return useQuery({
    queryKey: queryKeys.waitlistEntries,
    queryFn: waitlistAdminApi.list,
    staleTime: STALE_TIME.medium,
  });
}

export function useApproveEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (email: string) => waitlistAdminApi.approve(email),
    onMutate: async (email) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.waitlistEntries });
      const previous = queryClient.getQueryData<WaitlistEntry[]>(queryKeys.waitlistEntries);

      queryClient.setQueryData<WaitlistEntry[]>(queryKeys.waitlistEntries, (old) =>
        old?.map((entry) => (entry.email === email ? { ...entry, status: "APPROVED" } : entry))
      );

      return { previous };
    },
    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.waitlistEntries, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.waitlistEntries });
    },
  });
}
