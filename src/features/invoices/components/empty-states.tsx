"use client";

import { Button } from "@mui/material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AddIcon from "@mui/icons-material/Add";
import { EmptyState } from "@app/shared/ui/empty-state";

interface EmptyInvoicesProps {
  onCreateInvoice: () => void;
}

export function EmptyInvoicesState({ onCreateInvoice }: EmptyInvoicesProps) {
  return (
    <EmptyState
      icon={<ReceiptLongIcon sx={{ fontSize: 40, color: "primary.main" }} />}
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
