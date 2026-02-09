"use client";

import { Box, Typography, alpha, useTheme } from "@mui/material";
import { UI } from "@app/shared/config/config";

interface LogoPreviewProps {
  logoUrl: string;
}

export function LogoPreview({ logoUrl }: LogoPreviewProps) {
  const theme = useTheme();

  if (!logoUrl) {
    return null;
  }

  return (
    <Box
      sx={{
        p: 2,
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
        bgcolor: alpha(theme.palette.background.default, 0.5),
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
        Logo Preview
      </Typography>
      <Box
        component="img"
        src={logoUrl}
        alt="Logo preview"
        sx={{
          maxWidth: UI.BRANDING_LOGO_MAX_WIDTH,
          maxHeight: UI.BRANDING_LOGO_MAX_HEIGHT,
          objectFit: "contain",
        }}
        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
          e.currentTarget.style.display = "none";
        }}
      />
    </Box>
  );
}
