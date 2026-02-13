import { fetchApi } from "@app/shared/api/base";

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface RecentInvoice {
  id: string;
  publicId: string;
  clientName: string;
  total: number;
  currency: string;
  status: string;
  createdAt: string;
}

export interface CurrencyMetrics {
  totalRevenue: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  outstandingBalance: number;
  overdueAmount: number;
  monthlyRevenue: MonthlyRevenue[];
}

export interface AnalyticsData {
  currencies: string[];
  byCurrency: Record<string, CurrencyMetrics>;
  totalRevenue: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  outstandingBalance: number;
  overdueAmount: number;
  totalInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
  statusCounts: Record<string, number>;
  monthlyRevenue: MonthlyRevenue[];
  clientCount: number;
  recentInvoices: RecentInvoice[];
}

export const analyticsApi = {
  get: () => fetchApi<AnalyticsData>("/api/analytics"),
};
