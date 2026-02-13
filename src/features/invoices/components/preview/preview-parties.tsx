"use client";

import { alpha, Grid, Typography, useTheme } from "@mui/material";

interface PreviewPartiesProps {
  client: {
    name: string;
    email: string;
  };
}

export function PreviewParties({ client }: PreviewPartiesProps) {
  const theme = useTheme();

  return (
    <Grid
      container
      spacing={4}
      sx={{
        mb: 4,
        p: 3,
        borderRadius: 2,
        bgcolor: alpha(theme.palette.primary.main, 0.02),
      }}
    >
      <Grid size={{ xs: 12, md: 6 }}>
        <Typography variant="overline" color="text.secondary" fontWeight={600}>
          From
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Your business info will appear here
        </Typography>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Typography variant="overline" color="text.secondary" fontWeight={600}>
          Bill To
        </Typography>
        <Typography variant="h6" fontWeight={600} sx={{ mt: 1 }}>
          {client.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {client.email}
        </Typography>
      </Grid>
    </Grid>
  );
}
