"use client";

import * as React from "react";

import AddIcon from "@mui/icons-material/Add";
import { Button } from "@mui/material";

import { useQueryClient } from "@tanstack/react-query";

import { BANKING } from "@app/shared/config/config";
import { queryKeys } from "@app/shared/config/query";
import { useToast } from "@app/shared/hooks/use-toast";

import { useCreateConnection } from "../hooks";

export function ConnectBankButton() {
  const createConnection = useCreateConnection();
  const queryClient = useQueryClient();
  const toast = useToast();
  const popupRef = React.useRef<Window | null>(null);

  const invalidateBankingQueries = React.useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.bankConnections });
    queryClient.invalidateQueries({ queryKey: queryKeys.bankTransactions });
  }, [queryClient]);

  React.useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.data?.type === "bank-connected") {
        toast.success("Bank connected successfully!");
        invalidateBankingQueries();
        popupRef.current = null;
      }
    }

    function handleFocus() {
      if (popupRef.current && popupRef.current.closed) {
        popupRef.current = null;
        invalidateBankingQueries();
      }
    }

    window.addEventListener("message", handleMessage);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("focus", handleFocus);
    };
  }, [invalidateBankingQueries, toast]);

  const handleConnect = async () => {
    const result = await createConnection.mutateAsync(undefined);
    const left = window.screenX + (window.innerWidth - BANKING.POPUP_WIDTH) / 2;
    const top = window.screenY + (window.innerHeight - BANKING.POPUP_HEIGHT) / 2;

    popupRef.current = window.open(
      result.connectUrl,
      "salt_edge_connect",
      `width=${BANKING.POPUP_WIDTH},height=${BANKING.POPUP_HEIGHT},left=${left},top=${top},toolbar=no,menubar=no`
    );
  };

  return (
    <Button
      variant="contained"
      startIcon={<AddIcon />}
      onClick={handleConnect}
      disabled={createConnection.isPending}
      size="small"
    >
      Connect Bank
    </Button>
  );
}
