"use client";

import { useRouter } from "next/navigation";

import { alpha, Box, Button, Divider, Stack, Typography, useTheme } from "@mui/material";

import { UI } from "@app/shared/config/config";
import { LoadingButton } from "@app/shared/ui/loading-button";

import type { InvoiceFormMode } from "../types";

interface InvoiceFormTotalsProps {
  subtotal: number;
  currency: string;
  isPending: boolean;
  mode: InvoiceFormMode;
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
      <Stack direction="row" sx={{ justifyContent: "flex-end", mb: 4 }}>
        <Box
          sx={{
            p: 3,
            bgcolor: alpha(theme.palette.primary.main, UI.ALPHA_HOVER),
            borderRadius: 2,
            minWidth: { xs: "100%", sm: 250 },
          }}
        >
          <Stack direction="row" sx={{ justifyContent: "space-between", mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Subtotal
            </Typography>
            <Typography variant="body2">
              {currency} {formattedTotal}
            </Typography>
          </Stack>
          <Divider sx={{ my: 1.5 }} />
          <Stack direction="row" sx={{ justifyContent: "space-between" }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Total
            </Typography>
            <Typography variant="subtitle1" fontWeight={700} color="primary.main">
              {currency} {formattedTotal}
            </Typography>
          </Stack>
        </Box>
      </Stack>

      <Stack direction="row" spacing={2} sx={{ justifyContent: "flex-end" }}>
        <Button variant="outlined" onClick={() => router.push(cancelPath)}>
          Cancel
        </Button>
        <LoadingButton type="submit" variant="contained" loading={isPending}>
          {mode === "create" ? "Create Invoice" : "Save Changes"}
        </LoadingButton>
      </Stack>
    </>
  );
}
