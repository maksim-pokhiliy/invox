import { prisma } from "@app/server/db";

interface CurrencyMetrics {
  totalRevenue: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  outstandingBalance: number;
  overdueAmount: number;
  monthlyRevenue: { month: string; revenue: number }[];
}

interface RecentInvoice {
  id: string;
  publicId: string;
  status: string;
  total: number;
  currency: string;
  clientName: string;
  createdAt: string;
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
  monthlyRevenue: { month: string; revenue: number }[];
  clientCount: number;
  recentInvoices: RecentInvoice[];
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const SIXTY_DAYS_MS = 60 * 24 * 60 * 60 * 1000;
const MONTHS_TO_SHOW = 6;
const RECENT_INVOICES_LIMIT = 5;

function calculateMonthlyRevenue(
  paidInvoices: { paidAt: Date | null; total: number }[],
  now: Date
): { month: string; revenue: number }[] {
  const result: { month: string; revenue: number }[] = [];

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

export async function getAnalytics(userId: string): Promise<AnalyticsData> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - THIRTY_DAYS_MS);
  const sixtyDaysAgo = new Date(now.getTime() - SIXTY_DAYS_MS);

  const invoices = await prisma.invoice.findMany({
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

  const currencies = [...new Set(invoices.map((inv) => inv.currency))];
  const byCurrency: Record<string, CurrencyMetrics> = {};

  for (const currency of currencies) {
    const currencyInvoices = invoices.filter((inv) => inv.currency === currency);
    const paidInvoices = currencyInvoices.filter((inv) => inv.status === "PAID" || inv.paidAt);

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

    const outstandingInvoices = currencyInvoices.filter(
      (inv) =>
        !inv.paidAt &&
        (inv.status === "SENT" || inv.status === "VIEWED" || inv.status === "OVERDUE")
    );
    const outstandingBalance = outstandingInvoices.reduce((sum, inv) => sum + inv.total, 0);

    const overdueInvoices = currencyInvoices.filter(
      (inv) => !inv.paidAt && new Date(inv.dueDate) < now && inv.status !== "DRAFT"
    );
    const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + inv.total, 0);

    const monthlyRevenue = calculateMonthlyRevenue(paidInvoices, now);

    byCurrency[currency] = {
      totalRevenue,
      revenueThisMonth,
      revenueLastMonth,
      outstandingBalance,
      overdueAmount,
      monthlyRevenue,
    };
  }

  const allPaidInvoices = invoices.filter((inv) => inv.status === "PAID" || inv.paidAt);
  const totalRevenue = allPaidInvoices.reduce((sum, inv) => sum + inv.total, 0);

  const revenueThisMonth = allPaidInvoices
    .filter((inv) => inv.paidAt && new Date(inv.paidAt) >= thirtyDaysAgo)
    .reduce((sum, inv) => sum + inv.total, 0);

  const revenueLastMonth = allPaidInvoices
    .filter(
      (inv) =>
        inv.paidAt && new Date(inv.paidAt) >= sixtyDaysAgo && new Date(inv.paidAt) < thirtyDaysAgo
    )
    .reduce((sum, inv) => sum + inv.total, 0);

  const allOutstandingInvoices = invoices.filter(
    (inv) =>
      !inv.paidAt && (inv.status === "SENT" || inv.status === "VIEWED" || inv.status === "OVERDUE")
  );
  const outstandingBalance = allOutstandingInvoices.reduce((sum, inv) => sum + inv.total, 0);

  const allOverdueInvoices = invoices.filter(
    (inv) => !inv.paidAt && new Date(inv.dueDate) < now && inv.status !== "DRAFT"
  );
  const overdueAmount = allOverdueInvoices.reduce((sum, inv) => sum + inv.total, 0);

  const statusCounts = invoices.reduce(
    (acc, inv) => {
      let status = inv.status;
      if (!inv.paidAt && inv.status !== "DRAFT" && new Date(inv.dueDate) < now) {
        status = "OVERDUE";
      }
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const monthlyRevenue = calculateMonthlyRevenue(allPaidInvoices, now);

  const recentInvoices = await prisma.invoice.findMany({
    where: { userId },
    include: {
      client: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: RECENT_INVOICES_LIMIT,
  });

  const clientCount = await prisma.client.count({
    where: { userId },
  });

  return {
    currencies,
    byCurrency,
    totalRevenue,
    revenueThisMonth,
    revenueLastMonth,
    outstandingBalance,
    overdueAmount,
    totalInvoices: invoices.length,
    paidInvoices: allPaidInvoices.length,
    overdueInvoices: allOverdueInvoices.length,
    statusCounts,
    monthlyRevenue,
    clientCount,
    recentInvoices: recentInvoices.map((inv) => ({
      id: inv.id,
      publicId: inv.publicId,
      status: inv.status,
      total: inv.total,
      currency: inv.currency,
      clientName: inv.client.name,
      createdAt: inv.createdAt.toISOString(),
    })),
  };
}
