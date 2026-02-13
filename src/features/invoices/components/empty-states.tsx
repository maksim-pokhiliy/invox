"use client";

import AddIcon from "@mui/icons-material/Add";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { Button } from "@mui/material";

import { EmptyState } from "@app/shared/ui/empty-state";
import { EmptyInvoicesIllustration } from "@app/shared/ui/illustrations/empty-invoices";

interface EmptyInvoicesProps {
  onCreateInvoice: () => void;
}

export function EmptyInvoicesState({ onCreateInvoice }: EmptyInvoicesProps) {
  return (
    <EmptyState
      icon={<ReceiptLongIcon />}
      illustration={<EmptyInvoicesIllustration />}
      title="No invoices yet"
      description="Create your first invoice and start getting paid faster. Track payments, send reminders, and manage your cash flow all in one place."
      action={
        <Button variant="contained" size="large" startIcon={<AddIcon />} onClick={onCreateInvoice}>
          Create Your First Invoice
        </Button>
      }
    />
  );
}
