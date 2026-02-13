"use client";

import { Box, useTheme } from "@mui/material";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { CHART } from "@app/shared/config/config";
import { formatCurrencyCompact } from "@app/shared/lib/format";
import { CardSkeleton } from "@app/shared/ui/skeletons";

import type { MonthlyRevenue } from "../api";

interface RevenueChartProps {
  isLoading: boolean;
  monthlyRevenue: MonthlyRevenue[];
  displayCurrency: string;
}

const GRADIENT_ID = "revenueGradient";

export function RevenueChart({ isLoading, monthlyRevenue, displayCurrency }: RevenueChartProps) {
  const theme = useTheme();

  if (isLoading) {
    return <CardSkeleton />;
  }

  return (
    <Box role="img" aria-label={`Revenue chart showing last 6 months in ${displayCurrency}`}>
      <ResponsiveContainer width="100%" height={CHART.HEIGHT}>
        <AreaChart data={monthlyRevenue}>
          <defs>
            <linearGradient id={GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.palette.primary.main} stopOpacity={0.3} />
              <stop offset="100%" stopColor={theme.palette.primary.main} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray={CHART.GRID_DASH} vertical={false} />
          <XAxis dataKey="month" axisLine={false} tickLine={false} />
          <YAxis
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) =>
              new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: displayCurrency,
                notation: "compact",
                maximumFractionDigits: 0,
              }).format(value / 100)
            }
          />
          <Tooltip
            formatter={(value) => [
              formatCurrencyCompact(value as number, displayCurrency),
              "Revenue",
            ]}
            contentStyle={{
              borderRadius: CHART.TOOLTIP_BORDER_RADIUS,
              border: "none",
              boxShadow: CHART.TOOLTIP_SHADOW,
              backgroundColor: theme.palette.background.paper,
            }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke={theme.palette.primary.main}
            strokeWidth={2.5}
            fill={`url(#${GRADIENT_ID})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}
