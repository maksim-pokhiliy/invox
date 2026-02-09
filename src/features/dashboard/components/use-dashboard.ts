"use client";

import * as React from "react";
import { useAnalytics } from "@app/features/dashboard";

interface ExternalData {
  clientCount: number;
  invoiceCount: number;
  hasSentInvoice: boolean;
  hasProfile: boolean;
  isExternalDataLoading: boolean;
}

interface OnboardingStep {
  label: string;
  completed: boolean;
  href: string;
}

const EMPTY_MONTHLY_REVENUE: { month: string; revenue: number }[] = [];

function deriveCurrencyValues(
  analytics: ReturnType<typeof useAnalytics>["data"],
  selectedCurrency: string | null
) {
  const currencyMetrics =
    selectedCurrency && analytics?.byCurrency ? analytics.byCurrency[selectedCurrency] : undefined;
  const source = currencyMetrics ?? analytics;
  const displayCurrency = selectedCurrency || "USD";

  if (!source) {
    return {
      displayCurrency,
      totalRevenue: 0,
      revenueThisMonth: 0,
      revenueLastMonth: 0,
      outstandingBalance: 0,
      overdueAmount: 0,
      monthlyRevenue: EMPTY_MONTHLY_REVENUE,
    };
  }

  return {
    displayCurrency,
    totalRevenue: source.totalRevenue,
    revenueThisMonth: source.revenueThisMonth,
    revenueLastMonth: source.revenueLastMonth,
    outstandingBalance: source.outstandingBalance,
    overdueAmount: source.overdueAmount,
    monthlyRevenue: source.monthlyRevenue,
  };
}

function buildOnboardingSteps(
  hasProfile: boolean,
  clientCount: number,
  invoiceCount: number,
  hasSentInvoice: boolean
): OnboardingStep[] {
  return [
    { label: "Set up business profile", completed: hasProfile, href: "/app/settings" },
    { label: "Add your first client", completed: clientCount > 0, href: "/app/clients" },
    { label: "Create your first invoice", completed: invoiceCount > 0, href: "/app/invoices/new" },
    { label: "Send your first invoice", completed: hasSentInvoice, href: "/app/invoices" },
  ];
}

export function useDashboard(external: ExternalData) {
  const { data: analytics, isLoading, error } = useAnalytics();
  const [selectedCurrency, setSelectedCurrency] = React.useState<string | null>(null);

  const onboardingSteps = React.useMemo(
    () =>
      buildOnboardingSteps(
        external.hasProfile,
        external.clientCount,
        external.invoiceCount,
        external.hasSentInvoice
      ),
    [external.hasProfile, external.clientCount, external.invoiceCount, external.hasSentInvoice]
  );

  React.useEffect(() => {
    if (analytics?.currencies && analytics.currencies.length > 0 && !selectedCurrency) {
      setSelectedCurrency(analytics.currencies[0]);
    }
  }, [analytics?.currencies, selectedCurrency]);

  const currencyValues = deriveCurrencyValues(analytics, selectedCurrency);

  const revenueChange =
    currencyValues.revenueLastMonth > 0
      ? ((currencyValues.revenueThisMonth - currencyValues.revenueLastMonth) /
          currencyValues.revenueLastMonth) *
        100
      : 0;

  const hasMultipleCurrencies = (analytics?.currencies?.length ?? 0) > 1;
  const isOnboardingReady = !external.isExternalDataLoading;

  return {
    analytics,
    isLoading,
    error,
    selectedCurrency,
    setSelectedCurrency,
    onboardingSteps,
    isOnboardingReady,
    hasMultipleCurrencies,
    revenueChange,
    ...currencyValues,
  };
}
