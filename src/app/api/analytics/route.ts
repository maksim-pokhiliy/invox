import { NextResponse } from "next/server";
import { requireUser } from "@app/server/auth/require-user";
import { prisma } from "@app/server/db";

export async function GET() {
  const user = await requireUser();

  // Get all invoices for the user
  const invoices = await prisma.invoice.findMany({
    where: { userId: user.id },
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

  // Calculate metrics
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Total revenue (paid invoices)
  const paidInvoices = invoices.filter((inv) => inv.status === "PAID" || inv.paidAt);
  const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);

  // Revenue this month
  const revenueThisMonth = paidInvoices
    .filter((inv) => inv.paidAt && new Date(inv.paidAt) >= thirtyDaysAgo)
    .reduce((sum, inv) => sum + inv.total, 0);

  // Revenue last month (for comparison)
  const revenueLastMonth = paidInvoices
    .filter(
      (inv) =>
        inv.paidAt && new Date(inv.paidAt) >= sixtyDaysAgo && new Date(inv.paidAt) < thirtyDaysAgo
    )
    .reduce((sum, inv) => sum + inv.total, 0);

  // Outstanding balance (unpaid invoices that are sent/viewed/overdue)
  const outstandingInvoices = invoices.filter(
    (inv) =>
      !inv.paidAt && (inv.status === "SENT" || inv.status === "VIEWED" || inv.status === "OVERDUE")
  );
  const outstandingBalance = outstandingInvoices.reduce((sum, inv) => sum + inv.total, 0);

  // Overdue amount
  const overdueInvoices = invoices.filter(
    (inv) => !inv.paidAt && new Date(inv.dueDate) < now && inv.status !== "DRAFT"
  );
  const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + inv.total, 0);

  // Invoices by status
  const statusCounts = invoices.reduce(
    (acc, inv) => {
      // Compute actual status (considering overdue)
      let status = inv.status;
      if (!inv.paidAt && inv.status !== "DRAFT" && new Date(inv.dueDate) < now) {
        status = "OVERDUE";
      }
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Monthly revenue for the last 6 months
  const monthlyRevenue: { month: string; revenue: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    const monthName = monthStart.toLocaleDateString("en-US", { month: "short" });

    const revenue = paidInvoices
      .filter((inv) => {
        if (!inv.paidAt) return false;
        const paidDate = new Date(inv.paidAt);
        return paidDate >= monthStart && paidDate <= monthEnd;
      })
      .reduce((sum, inv) => sum + inv.total, 0);

    monthlyRevenue.push({ month: monthName, revenue });
  }

  // Recent invoices (last 5)
  const recentInvoices = await prisma.invoice.findMany({
    where: { userId: user.id },
    include: {
      client: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Count clients
  const clientCount = await prisma.client.count({
    where: { userId: user.id },
  });

  return NextResponse.json({
    totalRevenue,
    revenueThisMonth,
    revenueLastMonth,
    outstandingBalance,
    overdueAmount,
    totalInvoices: invoices.length,
    paidInvoices: paidInvoices.length,
    overdueInvoices: overdueInvoices.length,
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
  });
}
