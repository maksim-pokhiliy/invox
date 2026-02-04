"use client";

import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import { Spinner } from "./Loading";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: "primary" | "error" | "warning";
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmColor = "primary",
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isLoading}>
          {cancelText}
        </Button>
        <Button variant="contained" color={confirmColor} onClick={onConfirm} disabled={isLoading}>
          {isLoading ? <Spinner size={20} /> : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Hook for managing confirm dialog state
export function useConfirmDialog() {
  const [state, setState] = React.useState<{
    open: boolean;
    title: string;
    message: string;
    confirmText?: string;
    confirmColor?: "primary" | "error" | "warning";
    onConfirm: () => void | Promise<void>;
  }>({
    open: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });
  const [isLoading, setIsLoading] = React.useState(false);

  const confirm = React.useCallback(
    (options: {
      title: string;
      message: string;
      confirmText?: string;
      confirmColor?: "primary" | "error" | "warning";
      onConfirm: () => void | Promise<void>;
    }) => {
      setState({ open: true, ...options });
    },
    []
  );

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
