import { INVOICE_STATUS } from "@app/shared/config/invoice-status";
import { isOverdue } from "@app/shared/lib/invoice-status-predicates";
import type { AnalyticsData, CurrencyMetrics, MonthlyRevenue } from "@app/shared/schemas/api";
import type { UserId } from "@app/shared/types/ids";

import { prisma } from "@app/server/db";

interface InvoiceForMetrics {
  status: string;
  total: number;
  paidAt: Date | null;
  dueDate: Date;
}

interface InvoiceForAggregation extends InvoiceForMetrics {
  currency: string;
}

type RecentInvoiceRow = {
  id: string;
  publicId: string;
  status: string;
  total: number;
  currency: string;
  createdAt: Date;
  client: { name: string };
};

type AggregatedMetrics = Omit<AnalyticsData, "recentInvoices" | "clientCount">;

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const SIXTY_DAYS_MS = 60 * 24 * 60 * 60 * 1000;
const MONTHS_TO_SHOW = 6;
const RECENT_INVOICES_LIMIT = 5;

function calculateMonthlyRevenue(
  paidInvoices: { paidAt: Date | null; total: number }[],
  now: Date
): MonthlyRevenue[] {
  const result: MonthlyRevenue[] = [];

  for (let i = MONTHS_TO_SHOW - 1; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    const monthName = monthStart.toLocaleDateString("en-US", { month: "short" });

    const revenue = paidInvoices
      .filter((inv) => {
        if (!inv.paidAt) {
          return false;
        }

        const paidDate = new Date(inv.paidAt);

        return paidDate >= monthStart && paidDate <= monthEnd;
      })
      .reduce((sum, inv) => sum + inv.total, 0);

    result.push({ month: monthName, revenue });
  }

  return result;
}

function calculateMetricsForInvoices(
  invoices: InvoiceForMetrics[],
  now: Date,
  thirtyDaysAgo: Date,
  sixtyDaysAgo: Date
): Omit<CurrencyMetrics, "monthlyRevenue"> {
  const paidInvoices = invoices.filter((inv) => inv.status === INVOICE_STATUS.PAID || inv.paidAt);
  const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);

  const revenueThisMonth = paidInvoices
    .filter((inv) => inv.paidAt && new Date(inv.paidAt) >= thirtyDaysAgo)
    .reduce((sum, inv) => sum + inv.total, 0);

  const revenueLastMonth = paidInvoices
    .filter(
      (inv) =>
        inv.paidAt && new Date(inv.paidAt) >= sixtyDaysAgo && new Date(inv.paidAt) < thirtyDaysAgo
    )
    .reduce((sum, inv) => sum + inv.total, 0);

  const outstandingInvoices = invoices.filter(
    (inv) =>
      !inv.paidAt &&
      (inv.status === INVOICE_STATUS.SENT ||
        inv.status === INVOICE_STATUS.VIEWED ||
        inv.status === INVOICE_STATUS.OVERDUE)
  );
  const outstandingBalance = outstandingInvoices.reduce((sum, inv) => sum + inv.total, 0);

  const overdueInvoices = invoices.filter((inv) => isOverdue(inv, now));
  const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + inv.total, 0);

  return { totalRevenue, revenueThisMonth, revenueLastMonth, outstandingBalance, overdueAmount };
}

function fetchInvoicesForAnalytics(userId: UserId) {
  return prisma.invoice.findMany({
    where: { userId },
    select: {
      id: true,
      status: true,
      total: true,
      currency: true,
      paidAt: true,
      createdAt: true,
      dueDate: true,
    },
  });
}

function mapRecentInvoiceDto(invoice: RecentInvoiceRow): AnalyticsData["recentInvoices"][number] {
  return {
    id: invoice.id,
    publicId: invoice.publicId,
    status: invoice.status,
    total: invoice.total,
    currency: invoice.currency,
    clientName: invoice.client.name,
    createdAt: invoice.createdAt.toISOString(),
  };
}

async function fetchRecentInvoices(userId: UserId): Promise<AnalyticsData["recentInvoices"]> {
  const recent = await prisma.invoice.findMany({
    where: { userId },
    include: { client: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: RECENT_INVOICES_LIMIT,
  });

  return recent.map(mapRecentInvoiceDto);
}

function countClients(userId: UserId): Promise<number> {
  return prisma.client.count({ where: { userId } });
}

function buildByCurrencyMetrics(
  invoices: InvoiceForAggregation[],
  currencies: string[],
  now: Date,
  thirtyDaysAgo: Date,
  sixtyDaysAgo: Date
): Record<string, CurrencyMetrics> {
  const byCurrency: Record<string, CurrencyMetrics> = {};

  for (const currency of currencies) {
    const currencyInvoices = invoices.filter((inv) => inv.currency === currency);
    const paidInvoices = currencyInvoices.filter(
      (inv) => inv.status === INVOICE_STATUS.PAID || inv.paidAt
    );
    const metrics = calculateMetricsForInvoices(currencyInvoices, now, thirtyDaysAgo, sixtyDaysAgo);
    const monthlyRevenue = calculateMonthlyRevenue(paidInvoices, now);

    byCurrency[currency] = { ...metrics, monthlyRevenue };
  }

  return byCurrency;
}

function computeStatusCounts(invoices: InvoiceForAggregation[], now: Date): Record<string, number> {
  return invoices.reduce(
    (acc, inv) => {
      const status = isOverdue(inv, now) ? INVOICE_STATUS.OVERDUE : inv.status;

      acc[status] = (acc[status] || 0) + 1;

      return acc;
    },
    {} as Record<string, number>
  );
}

function aggregateMetrics(invoices: InvoiceForAggregation[], now: Date): AggregatedMetrics {
  const thirtyDaysAgo = new Date(now.getTime() - THIRTY_DAYS_MS);
  const sixtyDaysAgo = new Date(now.getTime() - SIXTY_DAYS_MS);

  const currencies = [...new Set(invoices.map((inv) => inv.currency))];
  const byCurrency = buildByCurrencyMetrics(invoices, currencies, now, thirtyDaysAgo, sixtyDaysAgo);

  const allPaidInvoices = invoices.filter(
    (inv) => inv.status === INVOICE_STATUS.PAID || inv.paidAt
  );
  const globalMetrics = calculateMetricsForInvoices(invoices, now, thirtyDaysAgo, sixtyDaysAgo);
  const allOverdueInvoices = invoices.filter((inv) => isOverdue(inv, now));
  const statusCounts = computeStatusCounts(invoices, now);
  const monthlyRevenue = calculateMonthlyRevenue(allPaidInvoices, now);

  return {
    currencies,
    byCurrency,
    ...globalMetrics,
    totalInvoices: invoices.length,
    paidInvoices: allPaidInvoices.length,
    overdueInvoices: allOverdueInvoices.length,
    statusCounts,
    monthlyRevenue,
  };
}

export async function getAnalytics(userId: UserId): Promise<AnalyticsData> {
  const now = new Date();
  const invoices = await fetchInvoicesForAnalytics(userId);
  const [recentInvoices, clientCount] = await Promise.all([
    fetchRecentInvoices(userId),
    countClients(userId),
  ]);

  return { ...aggregateMetrics(invoices, now), recentInvoices, clientCount };
}
