"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Box, Paper, Typography, Chip, alpha, useTheme } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import { useCountUp } from "@app/shared/hooks";
import { ANIMATION, UI } from "@app/shared/config/config";

interface MetricCardProps {
  title: string;
  value: string;
  numericValue?: number;
  formatValue?: (n: number) => string;
  icon: React.ReactNode;
  change?: number;
  changeLabel?: string;
  color?: string;
  href?: string;
}

export function MetricCard({
  title,
  value,
  numericValue,
  formatValue,
  icon,
  change,
  changeLabel,
  color,
  href,
}: MetricCardProps) {
  const theme = useTheme();
  const router = useRouter();
  const isPositive = change !== undefined && change >= 0;
  const animatedValue = useCountUp(numericValue ?? 0, ANIMATION.SLOW);
  const displayValue =
    numericValue !== undefined && formatValue ? formatValue(animatedValue) : value;
  const cardColor = color || theme.palette.primary.main;

  return (
    <Paper
      sx={{
        p: 2.5,
        borderRadius: 3,
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        ...(href && {
          cursor: "pointer",
          transition: `all ${ANIMATION.FAST}ms ease`,
          "&:hover": {
            boxShadow: `0 8px 24px ${alpha(cardColor, 0.15)}`,
            transform: "translateY(-2px)",
          },
        }),
      }}
      onClick={href ? () => router.push(href) : undefined}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          bgcolor: cardColor,
          borderRadius: "16px 16px 0 0",
        }}
      />
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Box
          sx={{
            width: UI.METRIC_ICON_SIZE,
            height: UI.METRIC_ICON_SIZE,
            borderRadius: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: alpha(cardColor, UI.ALPHA_MUTED),
            color: cardColor,
          }}
        >
          {icon}
        </Box>
        {change !== undefined && (
          <Chip
            size="small"
            icon={isPositive ? <TrendingUpIcon /> : <TrendingDownIcon />}
            label={`${isPositive ? "+" : ""}${change.toFixed(0)}%`}
            color={isPositive ? "success" : "error"}
            sx={{ fontWeight: 600 }}
          />
        )}
      </Box>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h4" fontWeight={700}>
        {displayValue}
      </Typography>
      {changeLabel && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
          {changeLabel}
        </Typography>
      )}
    </Paper>
  );
}
