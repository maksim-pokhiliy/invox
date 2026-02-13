"use client";

import { Box, Divider, Stack, Typography } from "@mui/material";

import { formatCurrency } from "@app/shared/lib/format";

interface PreviewTotalsProps {
  subtotal: number;
  total: number;
  currency: string;
}

export function PreviewTotals({ subtotal, total, currency }: PreviewTotalsProps) {
  return (
    <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
      <Box sx={{ minWidth: 250 }}>
        <Stack direction="row" sx={{ justifyContent: "space-between", mb: 1 }}>
          <Typography color="text.secondary">Subtotal</Typography>
          <Typography>{formatCurrency(subtotal, currency)}</Typography>
        </Stack>
        <Divider sx={{ my: 1 }} />
        <Stack direction="row" sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6" fontWeight={600}>
            Total
          </Typography>
          <Typography variant="h6" fontWeight={700} color="primary.main">
            {formatCurrency(total, currency)}
          </Typography>
        </Stack>
      </Box>
    </Stack>
  );
}
