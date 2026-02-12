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
  useTheme,
} from "@mui/material";

import { PreviewDates } from "./preview-dates";
import { PreviewHeader } from "./preview-header";
import { PreviewItems } from "./preview-items";
import { PreviewParties } from "./preview-parties";
import { PreviewTotals } from "./preview-totals";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface InvoiceItemGroup {
  id: string;
  title: string;
  items: InvoiceItem[];
}

interface InvoicePreviewDialogProps {
  open: boolean;
  onClose: () => void;
  onSend: () => void;
  invoice: {
    publicId: string;
    createdAt: string;
    dueDate: string;
    currency: string;
    subtotal: number;
    total: number;
    client: {
      name: string;
      email: string;
    };
    items: InvoiceItem[];
    itemGroups?: InvoiceItemGroup[];
  };
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
      <DialogTitle sx={{ fontWeight: 600, display: "flex", justifyContent: "space-between" }}>
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
