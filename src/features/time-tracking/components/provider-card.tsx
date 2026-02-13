"use client";

import * as React from "react";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import { ConfirmDialog } from "@app/shared/ui/confirm-dialog";

import type { TimeTrackingConnection } from "../api";
import { PROVIDER_META } from "../constants";
import { useDisconnectProvider } from "../hooks";
import { ConnectDialog } from "./connect-dialog";

interface ProviderCardProps {
  providerId: string;
  providerName: string;
  connection: TimeTrackingConnection | null;
}

export function ProviderCard({ providerId, providerName, connection }: ProviderCardProps) {
  const [connectOpen, setConnectOpen] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const disconnect = useDisconnectProvider();
  const meta = PROVIDER_META[providerId];
  const isConnected = !!connection;

  const handleDisconnectConfirm = () => {
    if (!connection) {
      return;
    }

    disconnect.mutate(connection.id, { onSettled: () => setConfirmOpen(false) });
  };

  return (
    <>
      <Card variant="outlined" sx={{ borderRadius: 2 }}>
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
                {providerName}
              </Typography>
              {isConnected && (
                <Chip
                  label="Connected"
                  color="success"
                  size="small"
                  sx={{ height: 20, fontSize: "caption.fontSize" }}
                />
              )}
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {isConnected
                ? connection.label
                : (meta?.description ?? "Import time entries to invoices")}
            </Typography>
          </Box>

          {isConnected ? (
            <Stack direction="row" spacing={0.5}>
              <Tooltip title="Disconnect">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => setConfirmOpen(true)}
                  disabled={disconnect.isPending}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          ) : (
            <Button variant="contained" size="small" onClick={() => setConnectOpen(true)}>
              Connect
            </Button>
          )}
        </CardContent>
      </Card>

      <ConnectDialog
        open={connectOpen}
        onClose={() => setConnectOpen(false)}
        providerId={providerId}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Disconnect integration"
        message={`Are you sure you want to disconnect ${providerName}?`}
        confirmText="Disconnect"
        confirmColor="error"
        isLoading={disconnect.isPending}
        onConfirm={handleDisconnectConfirm}
        onClose={() => setConfirmOpen(false)}
      />
    </>
  );
}
