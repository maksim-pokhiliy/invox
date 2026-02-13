"use client";

import * as React from "react";
import Link from "next/link";

import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { alpha, Box, Chip, Paper, Stack, Typography, useTheme } from "@mui/material";

import { ANIMATION, UI } from "@app/shared/config/config";
import { useCountUp } from "@app/shared/hooks";

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
  const isPositive = change !== undefined && change >= 0;
  const animatedValue = useCountUp(numericValue ?? 0, ANIMATION.SLOW);
  const displayValue =
    numericValue !== undefined && formatValue ? formatValue(animatedValue) : value;
  const cardColor = color || theme.palette.primary.main;

  return (
    <Paper
      {...(href ? { component: Link, href } : {})}
      sx={{
        display: "flex",
        flexDirection: "column",
        p: 2.5,
        borderRadius: 3,
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        textDecoration: "none",
        ...(href && {
          cursor: "pointer",
          transition: theme.transitions.create(["box-shadow", "transform"], {
            duration: theme.transitions.duration.short,
          }),
          "&:hover": {
            boxShadow: `0 8px 24px ${alpha(cardColor, 0.15)}`,
            transform: "translateY(-2px)",
          },
        }),
      }}
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
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Stack
          direction="row"
          sx={{
            width: UI.METRIC_ICON_SIZE,
            height: UI.METRIC_ICON_SIZE,
            borderRadius: 2.5,
            alignItems: "center",
            justifyContent: "center",
            bgcolor: alpha(cardColor, UI.ALPHA_MUTED),
            color: cardColor,
          }}
        >
          {icon}
        </Stack>
        {change !== undefined && (
          <Chip
            size="small"
            icon={isPositive ? <TrendingUpIcon /> : <TrendingDownIcon />}
            label={`${isPositive ? "+" : ""}${change.toFixed(0)}%`}
            color={isPositive ? "success" : "error"}
            sx={{ fontWeight: 600 }}
          />
        )}
      </Stack>
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
