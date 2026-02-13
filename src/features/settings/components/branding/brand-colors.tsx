"use client";

import { Box, Grid, Typography } from "@mui/material";

import { ColorPicker } from "./color-picker";

interface BrandColorsProps {
  primaryColor: string;
  accentColor: string;
  onPrimaryChange: (value: string) => void;
  onAccentChange: (value: string) => void;
}

export function BrandColors({
  primaryColor,
  accentColor,
  onPrimaryChange,
  onAccentChange,
}: BrandColorsProps) {
  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
        Brand Colors
      </Typography>
      <Grid container spacing={3}>
        <Grid size={6}>
          <ColorPicker label="Primary Color" value={primaryColor} onChange={onPrimaryChange} />
        </Grid>
        <Grid size={6}>
          <ColorPicker label="Accent Color" value={accentColor} onChange={onAccentChange} />
        </Grid>
      </Grid>
    </Box>
  );
}
