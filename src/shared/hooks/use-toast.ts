"use client";

import * as React from "react";

import type { ToastAction, ToastSeverity } from "@app/shared/ui/toast";

export interface ToastContextValue {
  showToast: (
    message: string,
    severity?: ToastSeverity,
    title?: string,
    duration?: number,
    action?: ToastAction
  ) => void;
  success: (message: string, title?: string, action?: ToastAction) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

export const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = React.useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
