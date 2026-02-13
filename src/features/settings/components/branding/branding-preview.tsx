"use client";

import { Box, Button, Stack, Typography } from "@mui/material";

import { UI } from "@app/shared/config/config";

interface BrandingPreviewProps {
  logoUrl: string;
  companyName: string;
  primaryColor: string;
  accentColor: string;
}

export function BrandingPreview({
  logoUrl,
  companyName,
  primaryColor,
  accentColor,
}: BrandingPreviewProps) {
  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
        Preview
      </Typography>
      <Box
        sx={{
          p: 3,
          border: 1,
          borderColor: "divider",
          borderRadius: 2,
          bgcolor: "background.paper",
        }}
      >
        <Stack direction="row" spacing={2} sx={{ alignItems: "center", mb: 2 }}>
          {logoUrl ? (
            <Box
              component="img"
              src={logoUrl}
              alt="Logo"
              sx={{
                maxWidth: UI.BRANDING_PREVIEW_MAX_WIDTH,
                maxHeight: UI.BRANDING_PREVIEW_MAX_HEIGHT,
                objectFit: "contain",
              }}
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <Typography variant="h6" fontWeight={700} sx={{ color: primaryColor }}>
              {companyName || "Your Company"}
            </Typography>
          )}
        </Stack>
        <Typography variant="h5" fontWeight={700} sx={{ color: primaryColor, mb: 1 }}>
          Invoice #INV-001
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button
            size="small"
            variant="contained"
            sx={{ bgcolor: primaryColor, "&:hover": { bgcolor: primaryColor } }}
          >
            Pay Now
          </Button>
          <Button
            size="small"
            variant="outlined"
            sx={{
              color: accentColor,
              borderColor: accentColor,
              "&:hover": { borderColor: accentColor },
            }}
          >
            Download
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
