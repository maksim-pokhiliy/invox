"use client";

import * as React from "react";

import type { ProviderInfo, TimeTrackingConnection } from "../api";

export function useImportDrawer(
  connections: TimeTrackingConnection[] | undefined,
  providers: ProviderInfo[] | undefined
) {
  const [open, setOpen] = React.useState(false);

  const activeConnection = connections?.[0];
  const activeProvider = activeConnection
    ? providers?.find((p) => p.id === activeConnection.provider)
    : undefined;

  return {
    open,
    setOpen,
    hasConnection: !!activeConnection,
    providerId: activeConnection?.provider ?? "",
    provider: activeProvider ?? null,
  };
}
