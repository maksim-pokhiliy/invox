"use client";

import * as React from "react";

import { alpha, Box, Typography, useTheme } from "@mui/material";

import { UI } from "@app/shared/config/config";

interface LogoProps {
  size?: "small" | "medium" | "large";
  showText?: boolean;
}

const SIZES = {
  small: { icon: 24, text: "1.125rem", gap: 0.75, symbol: 0.6 },
  medium: { icon: 28, text: "1.375rem", gap: 1, symbol: 0.6 },
  large: { icon: 34, text: "1.75rem", gap: 1.25, symbol: 0.6 },
} as const;

export function Logo({ size = "medium", showText = true }: LogoProps) {
  const theme = useTheme();
  const { icon: iconSize, text: textSize, gap, symbol } = SIZES[size];

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap }}>
      <Box
        sx={{
          width: iconSize,
          height: iconSize,
          borderRadius: 2,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, UI.LOGO_SHADOW_ALPHA)}`,
        }}
      >
        <Typography
          sx={{
            color: "white",
            fontSize: iconSize * symbol,
            fontWeight: 900,
            lineHeight: 1,
          }}
        >
          $
        </Typography>
      </Box>

      {showText && (
        <Typography
          sx={{
            fontSize: textSize,
            fontWeight: 700,
            letterSpacing: "-0.025em",
            color: "text.primary",
          }}
        >
          Get
          <Box component="span" sx={{ color: "primary.main" }}>
            Paid
          </Box>
        </Typography>
      )}
    </Box>
  );
}
