"use client";

import * as React from "react";

import AddIcon from "@mui/icons-material/Add";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";

import { formatCurrency } from "@app/shared/lib/format";
import { LoadingButton } from "@app/shared/ui/loading-button";

interface RecordPaymentDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (amount: string, note: string) => void;
  isLoading: boolean;
  remainingBalance: number;
  currency: string;
}

export function RecordPaymentDialog({
  open,
  onClose,
  onConfirm,
  isLoading,
  remainingBalance,
  currency,
}: RecordPaymentDialogProps) {
  const [amount, setAmount] = React.useState("");
  const [note, setNote] = React.useState("");

  const handleConfirm = () => {
    onConfirm(amount, note);
  };

  const handleClose = () => {
    setAmount("");
    setNote("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>Record Payment</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Record a partial or full payment for this invoice. Remaining balance:{" "}
          <strong>{formatCurrency(remainingBalance, currency)}</strong>
        </DialogContentText>
        <TextField
          autoFocus
          label="Amount"
          type="number"
          fullWidth
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <Typography color="text.secondary" sx={{ mr: 0.5 }}>
                  {currency}
                </Typography>
              ),
            },
          }}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Note (optional)"
          fullWidth
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g., Bank transfer, Check #123"
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose}>Cancel</Button>
        <LoadingButton
          variant="contained"
          color="success"
          onClick={handleConfirm}
          disabled={!amount}
          loading={isLoading}
          startIcon={<AddIcon />}
        >
          Record Payment
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
