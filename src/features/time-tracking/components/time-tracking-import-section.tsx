"use client";

import * as React from "react";

import TimerIcon from "@mui/icons-material/Timer";
import { Button, Stack } from "@mui/material";

import type { InvoiceItemGroupInput } from "@app/shared/schemas";

import type { ProviderInfo, TimeTrackingConnection } from "../api";
import { useTimeTrackingConnections, useTimeTrackingProviders } from "../hooks";
import { ImportDrawer, type ImportedGroup } from "./import-drawer";

function useImportDrawer(
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

function mapImportedGroups(groups: ImportedGroup[]): InvoiceItemGroupInput[] {
  return groups.map((g) => ({
    title: g.title,
    items: g.items.map((item) => ({
      title: item.title,
      description: item.description || undefined,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
  }));
}

interface TimeTrackingImportSectionProps {
  onImport: (groups: InvoiceItemGroupInput[]) => void;
  getpaidRateCents: number;
}

export function TimeTrackingImportSection({
  onImport,
  getpaidRateCents,
}: TimeTrackingImportSectionProps) {
  const { data: providers } = useTimeTrackingProviders();
  const { data: connections } = useTimeTrackingConnections();
  const importDrawer = useImportDrawer(connections, providers);

  const handleImport = (groups: ImportedGroup[]) => {
    onImport(mapImportedGroups(groups));
  };

  if (!importDrawer.hasConnection) {
    return null;
  }

  return (
    <>
      <Stack direction="row" sx={{ mb: 3, mt: -2 }}>
        <Button
          variant="outlined"
          startIcon={<TimerIcon />}
          onClick={() => importDrawer.setOpen(true)}
          size="small"
        >
          Import time
        </Button>
      </Stack>

      {importDrawer.provider && (
        <ImportDrawer
          open={importDrawer.open}
          onClose={() => importDrawer.setOpen(false)}
          providerId={importDrawer.providerId}
          provider={importDrawer.provider}
          getpaidRateCents={getpaidRateCents}
          onImport={handleImport}
        />
      )}
    </>
  );
}
