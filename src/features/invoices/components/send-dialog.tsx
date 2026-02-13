"use client";

import SendIcon from "@mui/icons-material/Send";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

import { LoadingButton } from "@app/shared/ui/loading-button";

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
