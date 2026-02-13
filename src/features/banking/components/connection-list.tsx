"use client";

import { useState } from "react";

import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SyncIcon from "@mui/icons-material/Sync";
import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import { formatDateTime } from "@app/shared/lib/format";
import { ConfirmDialog } from "@app/shared/ui/confirm-dialog";
import { EmptyState } from "@app/shared/ui/empty-state";
import { CardSkeleton } from "@app/shared/ui/skeletons";

import { CONNECTION_STATUS_CONFIG } from "../constants";
import { useConnections, useDeleteConnection, useSyncConnection } from "../hooks";

export function ConnectionList() {
  const { data: connections, isLoading } = useConnections();
  const deleteConnection = useDeleteConnection();
  const syncConnection = useSyncConnection();
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const handleSync = (id: string) => {
    setSyncingId(id);
    syncConnection.mutate(id, { onSettled: () => setSyncingId(null) });
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) {
      return;
    }

    deleteConnection.mutate(deleteTarget.id, { onSettled: () => setDeleteTarget(null) });
  };

  if (isLoading) {
    return (
      <Stack spacing={1.5}>
        <CardSkeleton />
        <CardSkeleton />
      </Stack>
    );
  }

  if (!connections?.length) {
    return (
      <EmptyState
        icon={<AccountBalanceIcon />}
        title="No banks connected"
        description="Connect your bank account to automatically detect incoming payments and match them to invoices."
      />
    );
  }

  return (
    <>
      <Stack spacing={1.5}>
        {connections.map((connection) => {
          const statusConfig =
            CONNECTION_STATUS_CONFIG[connection.status] ?? CONNECTION_STATUS_CONFIG.inactive;
          const isSyncing = syncingId === connection.id && syncConnection.isPending;

          return (
            <Card key={connection.id} variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent
                component={Stack}
                direction="row"
                sx={{
                  p: 2,
                  "&:last-child": { pb: 2 },
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.5 }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {connection.providerName}
                    </Typography>
                    <Chip
                      label={statusConfig.label}
                      color={statusConfig.color}
                      size="small"
                      sx={{ height: 20, fontSize: "caption.fontSize" }}
                    />
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {connection.accounts.length} account
                    {connection.accounts.length !== 1 ? "s" : ""}
                    {connection.lastSyncAt && (
                      <> &middot; Last synced {formatDateTime(connection.lastSyncAt)}</>
                    )}
                  </Typography>
                </Box>

                <Stack direction="row" spacing={0.5}>
                  <Tooltip title="Sync now">
                    <IconButton
                      size="small"
                      onClick={() => handleSync(connection.id)}
                      disabled={isSyncing}
                    >
                      <SyncIcon
                        fontSize="small"
                        sx={{
                          animation: isSyncing ? "spin 1s linear infinite" : "none",
                          "@keyframes spin": {
                            "0%": { transform: "rotate(0deg)" },
                            "100%": { transform: "rotate(-360deg)" },
                          },
                        }}
                      />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Disconnect">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() =>
                        setDeleteTarget({ id: connection.id, name: connection.providerName })
                      }
                      disabled={deleteConnection.isPending}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Stack>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Disconnect bank"
        message={`Are you sure you want to disconnect ${deleteTarget?.name ?? "this bank"}? Transaction history will be preserved.`}
        confirmText="Disconnect"
        confirmColor="error"
        isLoading={deleteConnection.isPending}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
}
