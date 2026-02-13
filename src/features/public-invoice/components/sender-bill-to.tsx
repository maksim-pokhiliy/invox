"use client";

import { alpha, Grid, Typography } from "@mui/material";

interface SenderBillToProps {
  sender: {
    name: string;
    address: string;
    taxId: string;
  };
  client: {
    name: string;
    email: string;
  };
  primaryColor: string;
}

export function SenderBillTo({ sender, client, primaryColor }: SenderBillToProps) {
  return (
    <Grid
      container
      spacing={4}
      sx={{
        mb: 4,
        p: 3,
        borderRadius: 2,
        bgcolor: alpha(primaryColor, 0.04),
      }}
    >
      <Grid size={{ xs: 12, md: 6 }}>
        <Typography variant="overline" color="text.secondary" fontWeight={600}>
          From
        </Typography>
        <Typography variant="h6" fontWeight={600} sx={{ mt: 1 }}>
          {sender.name}
        </Typography>
        {sender.address && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ whiteSpace: "pre-line", mt: 0.5 }}
          >
            {sender.address}
          </Typography>
        )}
        {sender.taxId && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Tax ID: {sender.taxId}
          </Typography>
        )}
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Typography variant="overline" color="text.secondary" fontWeight={600}>
          Bill To
        </Typography>
        <Typography variant="h6" fontWeight={600} sx={{ mt: 1 }}>
          {client.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {client.email}
        </Typography>
      </Grid>
    </Grid>
  );
}
