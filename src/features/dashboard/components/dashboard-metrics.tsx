"use client";

import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WarningIcon from "@mui/icons-material/Warning";
import { Grid, useTheme } from "@mui/material";

import { formatCurrencyCompact } from "@app/shared/lib/format";
import { MetricCard } from "@app/shared/ui/metric-card";
import { StatSkeleton } from "@app/shared/ui/skeletons";
import { StaggerList } from "@app/shared/ui/stagger-list";

interface DashboardMetricsProps {
  isLoading: boolean;
  totalRevenue: number;
  revenueThisMonth: number;
  outstandingBalance: number;
  overdueAmount: number;
  revenueChange: number;
  displayCurrency: string;
}

interface MetricDefinition {
  title: string;
  value: number;
  icon: React.ReactNode;
  colorKey: "success" | "primary" | "warning" | "error";
  href: string;
  change?: number;
  changeLabel?: string;
}

function buildMetricDefinitions(props: DashboardMetricsProps): MetricDefinition[] {
  return [
    {
      title: "Total Revenue",
      value: props.totalRevenue,
      icon: <AccountBalanceWalletIcon />,
      colorKey: "success",
      href: "/app/invoices",
    },
    {
      title: "This Month",
      value: props.revenueThisMonth,
      icon: <TrendingUpIcon />,
      colorKey: "primary",
      href: "/app/invoices",
      change: props.revenueChange,
      changeLabel: "vs last month",
    },
    {
      title: "Outstanding",
      value: props.outstandingBalance,
      icon: <ReceiptLongIcon />,
      colorKey: "warning",
      href: "/app/invoices?status=SENT",
    },
    {
      title: "Overdue",
      value: props.overdueAmount,
      icon: <WarningIcon />,
      colorKey: "error",
      href: "/app/invoices?status=OVERDUE",
    },
  ];
}

export function DashboardMetrics(props: DashboardMetricsProps) {
  const theme = useTheme();
  const metrics = buildMetricDefinitions(props);

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <StaggerList>
        {metrics.map((metric) => (
          <Grid key={metric.title} size={{ xs: 12, sm: 6, md: 3 }}>
            {props.isLoading ? (
              <StatSkeleton />
            ) : (
              <MetricCard
                title={metric.title}
                value={formatCurrencyCompact(metric.value, props.displayCurrency)}
                numericValue={metric.value}
                formatValue={(n) => formatCurrencyCompact(n, props.displayCurrency)}
                icon={metric.icon}
                color={theme.palette[metric.colorKey].main}
                href={metric.href}
                change={metric.change}
                changeLabel={metric.changeLabel}
              />
            )}
          </Grid>
        ))}
      </StaggerList>
    </Grid>
  );
}
