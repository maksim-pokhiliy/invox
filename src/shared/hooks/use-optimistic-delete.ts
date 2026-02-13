"use client";

import * as React from "react";

import { type QueryKey, useQueryClient } from "@tanstack/react-query";

import { UI } from "@app/shared/config/config";
import { useToast } from "@app/shared/hooks/use-toast";

interface UseOptimisticDeleteOptions<T> {
  queryKey: QueryKey;
  getId: (item: T) => string;
  entityName: string;
  deleteFn: (id: string) => Promise<unknown>;
}

export function useOptimisticDelete<T>({
  queryKey,
  getId,
  entityName,
  deleteFn,
}: UseOptimisticDeleteOptions<T>) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [pendingIds, setPendingIds] = React.useState<Set<string>>(new Set());
  const pendingRef = React.useRef(new Map<string, NodeJS.Timeout>());
  const optionsRef = React.useRef({ queryKey, getId, entityName, deleteFn });

  optionsRef.current = { queryKey, getId, entityName, deleteFn };

  const deleteItem = React.useCallback(
    (item: T) => {
      const { getId, entityName, deleteFn, queryKey } = optionsRef.current;
      const id = getId(item);

      const existing = pendingRef.current.get(id);

      if (existing) {
        clearTimeout(existing);
      }

      setPendingIds((prev) => new Set(prev).add(id));

      const timeout = setTimeout(async () => {
        pendingRef.current.delete(id);

        try {
          await deleteFn(id);
          queryClient.invalidateQueries({ queryKey });
        } catch {
          toast.error(`Failed to delete ${entityName.toLowerCase()}`);
        } finally {
          setPendingIds((prev) => {
            const next = new Set(prev);

            next.delete(id);

            return next;
          });
        }
      }, UI.TOAST_DURATION_LONG);

      pendingRef.current.set(id, timeout);

      toast.success(`${entityName} deleted`, undefined, {
        label: "Undo",
        onClick: () => {
          clearTimeout(timeout);
          pendingRef.current.delete(id);
          setPendingIds((prev) => {
            const next = new Set(prev);

            next.delete(id);

            return next;
          });
        },
      });
    },
    [queryClient, toast]
  );

  React.useEffect(() => {
    const pending = pendingRef.current;

    return () => {
      const { deleteFn } = optionsRef.current;

      pending.forEach((timeout, id) => {
        clearTimeout(timeout);
        deleteFn(id).catch((error) => {
          console.warn("[optimistic-delete] Cleanup deletion failed:", error);
        });
      });
      pending.clear();
    };
  }, []);

  return { deleteItem, pendingIds };
}
