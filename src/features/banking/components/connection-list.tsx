"use client";

import {
  Box,
  Typography,
  IconButton,
  Chip,
  Stack,
  Card,
  CardContent,
  Tooltip,
} from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SyncIcon from "@mui/icons-material/Sync";
import { EmptyState } from "@app/shared/ui/empty-state";
import { CardSkeleton } from "@app/shared/ui/loading";
import { useConnections, useDeleteConnection, useSyncConnection } from "../hooks";
import { CONNECTION_STATUS_CONFIG } from "../constants";
import { formatDateTime } from "@app/shared/lib/format";

export function ConnectionList() {
  const { data: connections, isLoading } = useConnections();
  const deleteConnection = useDeleteConnection();
  const syncConnection = useSyncConnection();

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
        icon={<AccountBalanceIcon sx={{ fontSize: 40, color: "primary.main" }} />}
        title="No banks connected"
        description="Connect your bank account to automatically detect incoming payments and match them to invoices."
        dashed
      />
    );
  }

  return (
    <Stack spacing={1.5}>
      {connections.map((connection) => {
        const statusConfig =
          CONNECTION_STATUS_CONFIG[connection.status] ?? CONNECTION_STATUS_CONFIG.inactive;

        return (
          <Card key={connection.id} variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent
              sx={{
                p: 2,
                "&:last-child": { pb: 2 },
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {connection.providerName}
                  </Typography>
                  <Chip
                    label={statusConfig.label}
                    color={statusConfig.color}
                    size="small"
                    sx={{ height: 20, fontSize: "0.7rem" }}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {connection.accounts.length} account{connection.accounts.length !== 1 ? "s" : ""}
                  {connection.lastSyncAt && (
                    <> &middot; Last synced {formatDateTime(connection.lastSyncAt)}</>
                  )}
                </Typography>
              </Box>

              <Stack direction="row" spacing={0.5}>
                <Tooltip title="Sync now">
                  <IconButton
                    size="small"
                    onClick={() => syncConnection.mutate(connection.id)}
                    disabled={syncConnection.isPending}
                  >
                    <SyncIcon
                      fontSize="small"
                      sx={{
                        animation: syncConnection.isPending ? "spin 1s linear infinite" : "none",
                        "@keyframes spin": {
                          "0%": { transform: "rotate(0deg)" },
                          "100%": { transform: "rotate(360deg)" },
                        },
                      }}
                    />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Disconnect">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => deleteConnection.mutate(connection.id)}
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
  );
}
