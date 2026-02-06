"use client";

import { Box, Divider, Typography } from "@mui/material";

interface PaymentReferenceBlockProps {
  paymentReference: string;
}

export function PaymentReferenceBlock({ paymentReference }: PaymentReferenceBlockProps) {
  return (
    <>
      <Divider sx={{ my: 3 }} />
      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: "action.hover",
          textAlign: "center",
        }}
      >
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          Payment Reference
        </Typography>
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{ fontFamily: "monospace", letterSpacing: 1 }}
        >
          {paymentReference}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Please include this reference in your payment description
        </Typography>
      </Box>
    </>
  );
}
