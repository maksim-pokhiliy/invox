"use client";

import { Box, Paper, Typography, Chip, alpha, useTheme } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  change?: number;
  changeLabel?: string;
  color?: string;
}

export function MetricCard({ title, value, icon, change, changeLabel, color }: MetricCardProps) {
  const theme = useTheme();
  const isPositive = change !== undefined && change >= 0;

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 3,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: alpha(color || theme.palette.primary.main, 0.1),
            color: color || theme.palette.primary.main,
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
        {value}
      </Typography>
      {changeLabel && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
          {changeLabel}
        </Typography>
      )}
    </Paper>
  );
}
