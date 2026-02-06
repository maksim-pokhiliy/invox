"use client";

import * as React from "react";
import { Button } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import AddIcon from "@mui/icons-material/Add";
import { queryKeys } from "@app/shared/config/query";
import { useToast } from "@app/shared/ui/toast";
import { useCreateConnection } from "../hooks";

const POPUP_WIDTH = 600;
const POPUP_HEIGHT = 700;

export function ConnectBankButton() {
  const createConnection = useCreateConnection();
  const queryClient = useQueryClient();
  const toast = useToast();
  const popupRef = React.useRef<Window | null>(null);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryClient, toast]);

  function invalidateBankingQueries() {
    queryClient.invalidateQueries({ queryKey: queryKeys.bankConnections });
    queryClient.invalidateQueries({ queryKey: queryKeys.bankTransactions });
  }

  const handleConnect = async () => {
    const result = await createConnection.mutateAsync(undefined);
    const left = window.screenX + (window.innerWidth - POPUP_WIDTH) / 2;
    const top = window.screenY + (window.innerHeight - POPUP_HEIGHT) / 2;

    popupRef.current = window.open(
      result.connectUrl,
      "salt_edge_connect",
      `width=${POPUP_WIDTH},height=${POPUP_HEIGHT},left=${left},top=${top},toolbar=no,menubar=no`
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
