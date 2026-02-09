"use client";

import * as React from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AddIcon from "@mui/icons-material/Add";
import { LoadingButton } from "@app/shared/ui/loading-button";
import { formatCurrency } from "@app/shared/lib/format";

interface SendDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  clientEmail: string;
}

export function SendDialog({ open, onClose, onConfirm, isLoading, clientEmail }: SendDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>Send Invoice</DialogTitle>
      <DialogContent>
        <DialogContentText>
          An email will be sent to <strong>{clientEmail}</strong> with a link to view and pay this
          invoice.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <LoadingButton
          variant="contained"
          onClick={onConfirm}
          loading={isLoading}
          startIcon={<SendIcon />}
        >
          Send Invoice
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

interface MarkPaidDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export function MarkPaidDialog({ open, onClose, onConfirm, isLoading }: MarkPaidDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>Mark as Paid</DialogTitle>
      <DialogContent>
        <DialogContentText>
          This will mark the invoice as fully paid. Use this if you received the full payment
          amount.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <LoadingButton
          variant="contained"
          onClick={onConfirm}
          loading={isLoading}
          startIcon={<CheckCircleIcon />}
        >
          Mark as Paid
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

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
                  {currency === "USD" ? "$" : currency}
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
