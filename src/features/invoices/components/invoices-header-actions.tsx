"use client";

import AddIcon from "@mui/icons-material/Add";
import DownloadIcon from "@mui/icons-material/Download";
import { Button } from "@mui/material";

import { RESPONSIVE_SX } from "@app/shared/config/config";

interface InvoicesHeaderActionsProps {
  hasInvoices: boolean;
  onExport: () => void;
  onNew: () => void;
}

export function InvoicesHeaderActions({
  hasInvoices,
  onExport,
  onNew,
}: InvoicesHeaderActionsProps) {
  return (
    <>
      {hasInvoices && (
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={onExport}
          sx={RESPONSIVE_SX.DESKTOP_ONLY}
        >
          Export CSV
        </Button>
      )}
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onNew}
        sx={RESPONSIVE_SX.DESKTOP_ONLY}
      >
        New Invoice
      </Button>
    </>
  );
}
