"use client";

import * as React from "react";

import { useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@app/shared/api";
import { queryKeys } from "@app/shared/config/query";
import { useToast } from "@app/shared/hooks/use-toast";
import type { CreateClientInput } from "@app/shared/schemas";

import type { CreateClientMutation } from "../types";

export function useClientDialog(createClientMutation: CreateClientMutation) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSuccess = React.useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.clients });
    setOpen(false);
    setError(null);
    toast.success("Client added successfully!");
  }, [queryClient, toast]);

  const handleCreate = React.useCallback(
    (data: CreateClientInput) => {
      setError(null);
      createClientMutation.mutate(data, {
        onSuccess: () => handleSuccess(),
        onError: (err) => {
          setError(err instanceof ApiError ? err.message : "Failed to create client");
        },
      });
    },
    [createClientMutation, handleSuccess]
  );

  return {
    open,
    setOpen,
    error,
    handleCreate,
    isPending: createClientMutation.isPending,
  };
}
