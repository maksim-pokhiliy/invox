"use client";

import * as React from "react";
import { Box, Button, Typography, Alert, alpha, useTheme } from "@mui/material";
import PaymentIcon from "@mui/icons-material/Payment";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { ConfirmDialog } from "@app/components/feedback/ConfirmDialog";
import { useToast } from "@app/components/feedback/Toast";
import { useDisconnectStripe, ApiError } from "@app/lib/api";

interface PaymentsTabProps {
  isConnected: boolean;
}

export function PaymentsTab({ isConnected }: PaymentsTabProps) {
  const theme = useTheme();
  const toast = useToast();
  const [disconnectDialogOpen, setDisconnectDialogOpen] = React.useState(false);
  const disconnectStripeMutation = useDisconnectStripe();

  const handleDisconnectStripe = () => {
    disconnectStripeMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("Stripe account disconnected");
        setDisconnectDialogOpen(false);
      },
      onError: (err) => {
        toast.error(err instanceof ApiError ? err.message : "Failed to disconnect Stripe");
      },
    });
  };

  return (
    <>
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            bgcolor: isConnected
              ? alpha(theme.palette.success.main, 0.1)
              : alpha(theme.palette.primary.main, 0.1),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 3,
          }}
        >
          {isConnected ? (
            <CheckCircleIcon sx={{ fontSize: 40, color: "success.main" }} />
          ) : (
            <PaymentIcon sx={{ fontSize: 40, color: "primary.main" }} />
          )}
        </Box>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {isConnected ? "Stripe Connected" : "Connect Stripe"}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 3, maxWidth: 400, mx: "auto" }}
        >
          {isConnected
            ? "Your Stripe account is connected. You can accept online payments from your clients."
            : "Connect your Stripe account to accept online payments directly from invoices."}
        </Typography>
        {isConnected ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <Alert
              severity="success"
              icon={<CheckCircleIcon />}
              sx={{ maxWidth: 400, borderRadius: 2 }}
            >
              Stripe account connected successfully
            </Alert>
            <Button
              variant="outlined"
              color="error"
              startIcon={<LinkOffIcon />}
              onClick={() => setDisconnectDialogOpen(true)}
            >
              Disconnect Stripe
            </Button>
          </Box>
        ) : (
          <Button
            variant="contained"
            startIcon={<PaymentIcon />}
            size="large"
            href="/api/stripe/connect"
          >
            Connect Stripe Account
          </Button>
        )}
      </Box>

      <ConfirmDialog
        open={disconnectDialogOpen}
        title="Disconnect Stripe Account"
        message="Are you sure you want to disconnect your Stripe account? You will no longer be able to accept online payments until you reconnect."
        confirmText="Disconnect"
        confirmColor="error"
        onConfirm={handleDisconnectStripe}
        onClose={() => setDisconnectDialogOpen(false)}
        isLoading={disconnectStripeMutation.isPending}
      />
    </>
  );
}
