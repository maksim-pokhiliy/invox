"use client";

import SendIcon from "@mui/icons-material/Send";
import {
  Alert,
  alpha,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  useTheme,
} from "@mui/material";

import type { Invoice } from "@app/shared/schemas/api";

import { PreviewDates } from "./preview-dates";
import { PreviewHeader } from "./preview-header";
import { PreviewItems } from "./preview-items";
import { PreviewParties } from "./preview-parties";
import { PreviewTotals } from "./preview-totals";

interface InvoicePreviewDialogProps {
  open: boolean;
  onClose: () => void;
  onSend: () => void;
  invoice: Pick<
    Invoice,
    | "publicId"
    | "createdAt"
    | "dueDate"
    | "currency"
    | "subtotal"
    | "total"
    | "client"
    | "items"
    | "itemGroups"
  >;
}

export function InvoicePreviewDialog({
  open,
  onClose,
  onSend,
  invoice,
}: InvoicePreviewDialogProps) {
  const theme = useTheme();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        component={Stack}
        direction="row"
        sx={{ fontWeight: 600, justifyContent: "space-between" }}
      >
        Invoice Preview
        <Chip label="Preview Mode" size="small" color="info" />
      </DialogTitle>
      <DialogContent>
        <Paper
          variant="outlined"
          sx={{
            p: 4,
            bgcolor: alpha(theme.palette.background.paper, 0.5),
            borderRadius: 2,
          }}
        >
          <PreviewHeader publicId={invoice.publicId} />
          <PreviewParties client={invoice.client} />
          <PreviewDates createdAt={invoice.createdAt} dueDate={invoice.dueDate} />
          <Divider sx={{ my: 3 }} />
          <PreviewItems
            items={invoice.items}
            itemGroups={invoice.itemGroups}
            currency={invoice.currency}
          />
          <Divider sx={{ my: 3 }} />
          <PreviewTotals
            subtotal={invoice.subtotal}
            total={invoice.total}
            currency={invoice.currency}
          />
        </Paper>

        <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
          This is how your invoice will appear to your client. Once sent, they will receive an email
          with a link to view and pay this invoice.
        </Alert>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" onClick={onSend} startIcon={<SendIcon />}>
          Send Invoice
        </Button>
      </DialogActions>
    </Dialog>
  );
}
