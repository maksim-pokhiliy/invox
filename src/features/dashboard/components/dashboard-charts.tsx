"use client";

import { useRouter } from "next/navigation";

import { Button, Grid, Paper, Stack, Typography } from "@mui/material";

import { CHART } from "@app/shared/config/config";

import type { AnalyticsData, MonthlyRevenue } from "../api";
import { RecentInvoicesContent } from "./recent-invoices";
import { RevenueChart } from "./revenue-chart";
import { StatusBreakdown } from "./status-breakdown";

interface DashboardChartsProps {
  isLoading: boolean;
  analytics: AnalyticsData | undefined;
  monthlyRevenue: MonthlyRevenue[];
  displayCurrency: string;
  hasMultipleCurrencies: boolean;
}

export function DashboardCharts({
  isLoading,
  analytics,
  monthlyRevenue,
  displayCurrency,
  hasMultipleCurrencies,
}: DashboardChartsProps) {
  const router = useRouter();

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 8 }}>
        <Paper sx={{ p: 3, borderRadius: 3, height: CHART.PANEL_HEIGHT }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Revenue (Last 6 Months){hasMultipleCurrencies && ` - ${displayCurrency}`}
          </Typography>
          <RevenueChart
            isLoading={isLoading}
            monthlyRevenue={monthlyRevenue}
            displayCurrency={displayCurrency}
          />
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Paper sx={{ p: 3, borderRadius: 3, height: CHART.PANEL_HEIGHT }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Invoice Status
          </Typography>
          <StatusBreakdown
            isLoading={isLoading}
            statusCounts={analytics?.statusCounts}
            clientCount={analytics?.clientCount || 0}
          />
        </Paper>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Stack
            direction="row"
            sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}
          >
            <Typography variant="h6" fontWeight={600}>
              Recent Invoices
            </Typography>
            <Button size="small" onClick={() => router.push("/app/invoices")}>
              View All
            </Button>
          </Stack>
          <RecentInvoicesContent
            isLoading={isLoading}
            invoices={analytics?.recentInvoices}
            onNavigate={(path) => router.push(path)}
          />
        </Paper>
      </Grid>
    </Grid>
  );
}
