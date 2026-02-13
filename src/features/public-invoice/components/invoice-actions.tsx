"use client";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PrintIcon from "@mui/icons-material/Print";
import { alpha, Button, Stack } from "@mui/material";

interface InvoiceActionsProps {
  isPaid: boolean;
  accentColor: string;
}

export function InvoiceActions({ isPaid, accentColor }: InvoiceActionsProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        mt: 5,
        justifyContent: "center",
        "@media print": { display: "none" },
      }}
    >
      <Button
        variant="outlined"
        startIcon={<PrintIcon />}
        onClick={handlePrint}
        size="large"
        sx={{
          color: accentColor,
          borderColor: accentColor,
          "&:hover": {
            borderColor: accentColor,
            bgcolor: alpha(accentColor, 0.04),
          },
        }}
      >
        Print / Save PDF
      </Button>

      {isPaid && (
        <Button
          variant="contained"
          color="success"
          startIcon={<CheckCircleIcon />}
          disabled
          size="large"
        >
          Paid
        </Button>
      )}
    </Stack>
  );
}
