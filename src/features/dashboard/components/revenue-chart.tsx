"use client";

import { Box, useTheme } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { CardSkeleton } from "@app/shared/ui/loading";
import { formatCurrencyCompact } from "@app/shared/lib/format";
import { CHART } from "@app/shared/config/config";

interface MonthlyRevenue {
  month: string;
  revenue: number;
}

interface RevenueChartProps {
  isLoading: boolean;
  monthlyRevenue: MonthlyRevenue[];
  displayCurrency: string;
}

export function RevenueChart({ isLoading, monthlyRevenue, displayCurrency }: RevenueChartProps) {
  const theme = useTheme();

  if (isLoading) {
    return <CardSkeleton />;
  }

  return (
    <Box role="img" aria-label={`Revenue chart showing last 6 months in ${displayCurrency}`}>
      <ResponsiveContainer width="100%" height={CHART.HEIGHT}>
        <BarChart data={monthlyRevenue}>
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
            }}
          />
          <Bar dataKey="revenue" fill={theme.palette.primary.main} radius={CHART.BAR_RADIUS} />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
