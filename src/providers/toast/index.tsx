"use client";

import * as React from "react";

import { UI } from "@app/shared/config/config";
import { ToastContext, type ToastContextValue } from "@app/shared/hooks/use-toast";
import { type Toast, type ToastAction, ToastItem, type ToastSeverity } from "@app/shared/ui/toast";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const showToast = React.useCallback(
    (
      message: string,
      severity: ToastSeverity = "info",
      title?: string,
      duration: number = UI.TOAST_DURATION_DEFAULT,
      action?: ToastAction
    ) => {
      const id = Math.random().toString(36).substring(2, 9);

      setToasts((prev) => {
        const next = [...prev, { id, message, severity, title, duration, action }];

        if (next.length > UI.MAX_VISIBLE_TOASTS) {
          return next.slice(next.length - UI.MAX_VISIBLE_TOASTS);
        }

        return next;
      });
    },
    []
  );

  const hideToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = React.useMemo<ToastContextValue>(
    () => ({
      showToast,
      success: (message: string, title?: string, action?: ToastAction) =>
        showToast(message, "success", title, action ? UI.TOAST_DURATION_LONG : undefined, action),
      error: (message: string, title?: string) => showToast(message, "error", title),
      warning: (message: string, title?: string) => showToast(message, "warning", title),
      info: (message: string, title?: string) => showToast(message, "info", title),
    }),
    [showToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.map((toast, index) => (
        <ToastItem key={toast.id} toast={toast} index={index} onHide={hideToast} />
      ))}
    </ToastContext.Provider>
  );
}
