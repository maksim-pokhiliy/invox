"use client";

import { useRouter } from "next/navigation";
import { Box, Button, Divider, Typography, alpha, useTheme } from "@mui/material";
import { LoadingButton } from "@app/shared/ui/loading-button";
import { UI } from "@app/shared/config/config";

interface InvoiceFormTotalsProps {
  subtotal: number;
  currency: string;
  isPending: boolean;
  mode: "create" | "edit";
  invoiceId?: string;
}

export function InvoiceFormTotals({
  subtotal,
  currency,
  isPending,
  mode,
  invoiceId,
}: InvoiceFormTotalsProps) {
  const router = useRouter();
  const theme = useTheme();

  const formattedTotal = subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 });
  const cancelPath = mode === "create" ? "/app/invoices" : `/app/invoices/${invoiceId}`;

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 4 }}>
        <Box
          sx={{
            p: 3,
            bgcolor: alpha(theme.palette.primary.main, UI.ALPHA_HOVER),
            borderRadius: 2,
            minWidth: { xs: "100%", sm: 250 },
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Subtotal
            </Typography>
            <Typography variant="body2">
              {currency} {formattedTotal}
            </Typography>
          </Box>
          <Divider sx={{ my: 1.5 }} />
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Total
            </Typography>
            <Typography variant="subtitle1" fontWeight={700} color="primary.main">
              {currency} {formattedTotal}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
        <Button variant="outlined" onClick={() => router.push(cancelPath)}>
          Cancel
        </Button>
        <LoadingButton type="submit" variant="contained" loading={isPending}>
          {mode === "create" ? "Create Invoice" : "Save Changes"}
        </LoadingButton>
      </Box>
    </>
  );
}
