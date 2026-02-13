"use client";

import * as React from "react";

import type { ButtonProps } from "@mui/material";

import { ConfirmDialog } from "@app/shared/ui/confirm-dialog";

type ConfirmColor = ButtonProps["color"];

interface ConfirmDialogState {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  confirmColor?: ConfirmColor;
  onConfirm: () => void | Promise<void>;
}

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  confirmColor?: ConfirmColor;
  onConfirm: () => void | Promise<void>;
}

export function useConfirmDialog() {
  const [state, setState] = React.useState<ConfirmDialogState>({
    open: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });
  const [isLoading, setIsLoading] = React.useState(false);

  const confirm = React.useCallback((options: ConfirmOptions) => {
    setState({ open: true, ...options });
  }, []);

  const handleClose = React.useCallback(() => {
    if (!isLoading) {
      setState((prev) => ({ ...prev, open: false }));
    }
  }, [isLoading]);

  const onConfirmRef = React.useRef(state.onConfirm);

  onConfirmRef.current = state.onConfirm;

  const handleConfirm = React.useCallback(async () => {
    setIsLoading(true);

    try {
      await onConfirmRef.current();
      setState((prev) => ({ ...prev, open: false }));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const dialogProps = {
    open: state.open,
    onClose: handleClose,
    onConfirm: handleConfirm,
    title: state.title,
    message: state.message,
    confirmText: state.confirmText,
    confirmColor: state.confirmColor,
    isLoading,
  };

  return { confirm, dialogProps, ConfirmDialog };
}
