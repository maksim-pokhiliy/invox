"use client";

import { useRouter } from "next/navigation";

import AddIcon from "@mui/icons-material/Add";
import { Alert, Button, ToggleButton, ToggleButtonGroup } from "@mui/material";

import { RESPONSIVE_SX } from "@app/shared/config/config";
import { PageHeader } from "@app/shared/ui/page-header";

import { useDashboard } from "../hooks/use-dashboard";
import { DashboardCharts } from "./dashboard-charts";
import { DashboardMetrics } from "./dashboard-metrics";
import { OnboardingChecklist } from "./onboarding-checklist";

interface DashboardContentProps {
  clientCount: number;
  invoiceCount: number;
  hasSentInvoice: boolean;
  hasProfile: boolean;
  isExternalDataLoading: boolean;
}

export function DashboardContent(props: DashboardContentProps) {
  const router = useRouter();
  const dashboard = useDashboard(props);

  if (dashboard.error) {
    return (
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        Failed to load analytics data. Please try again.
      </Alert>
    );
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your invoicing activity"
        actions={
          <>
            {dashboard.hasMultipleCurrencies && dashboard.analytics?.currencies && (
              <ToggleButtonGroup
                value={dashboard.selectedCurrency}
                exclusive
                onChange={(_, value) => value && dashboard.setSelectedCurrency(value)}
                size="small"
                aria-label="Currency selection"
              >
                {dashboard.analytics.currencies.map((currency) => (
                  <ToggleButton key={currency} value={currency} sx={{ px: 2, fontWeight: 600 }}>
                    {currency}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            )}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => router.push("/app/invoices/new")}
              sx={RESPONSIVE_SX.DESKTOP_ONLY}
            >
              New Invoice
            </Button>
          </>
        }
      />

      <OnboardingChecklist
        steps={dashboard.onboardingSteps}
        isLoading={!dashboard.isOnboardingReady}
        onNavigate={(href) => router.push(href)}
      />

      <DashboardMetrics
        isLoading={dashboard.isLoading}
        totalRevenue={dashboard.totalRevenue}
        revenueThisMonth={dashboard.revenueThisMonth}
        outstandingBalance={dashboard.outstandingBalance}
        overdueAmount={dashboard.overdueAmount}
        revenueChange={dashboard.revenueChange}
        displayCurrency={dashboard.displayCurrency}
      />

      <DashboardCharts
        isLoading={dashboard.isLoading}
        analytics={dashboard.analytics}
        monthlyRevenue={dashboard.monthlyRevenue}
        displayCurrency={dashboard.displayCurrency}
        hasMultipleCurrencies={dashboard.hasMultipleCurrencies}
      />
    </>
  );
}
