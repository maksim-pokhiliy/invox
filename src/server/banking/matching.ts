import { prisma } from "@app/server/db";
import { recordPayment } from "@app/server/invoices";
import { BANKING } from "@app/shared/config/config";

interface MatchCandidate {
  invoiceId: string;
  score: number;
}

function calculateMatchScore(
  transaction: { amount: number; currencyCode: string; description: string; madeOn: Date },
  invoice: {
    id: string;
    currency: string;
    total: number;
    paidAmount: number;
    paymentReference: string | null;
    sentAt: Date | null;
  }
): MatchCandidate | null {
  if (transaction.currencyCode !== invoice.currency) {
    return null;
  }

  let score = 0;

  score += BANKING.MATCH_SCORE_CURRENCY;

  if (
    invoice.paymentReference &&
    transaction.description.toUpperCase().includes(invoice.paymentReference.toUpperCase())
  ) {
    score += BANKING.MATCH_SCORE_REFERENCE;
  }

  const remainingBalance = invoice.total - invoice.paidAmount;
  const tolerance = remainingBalance * BANKING.MATCH_AMOUNT_TOLERANCE;

  if (
    Math.abs(transaction.amount - invoice.total) <= tolerance ||
    Math.abs(transaction.amount - remainingBalance) <= tolerance
  ) {
    score += BANKING.MATCH_SCORE_AMOUNT;
  }

  if (invoice.sentAt && transaction.madeOn >= invoice.sentAt) {
    score += BANKING.MATCH_SCORE_DATE;
  }

  return { invoiceId: invoice.id, score };
}

export async function matchTransaction(transactionId: string, userId: string) {
  const transaction = await prisma.bankTransaction.findUniqueOrThrow({
    where: { id: transactionId },
  });

  if (transaction.amount <= 0) {
    return;
  }

  if (transaction.status !== "PENDING") {
    return;
  }

  const invoices = await prisma.invoice.findMany({
    where: {
      userId,
      status: { in: ["SENT", "VIEWED", "OVERDUE", "PARTIALLY_PAID"] },
    },
  });

  const candidates: MatchCandidate[] = [];

  for (const invoice of invoices) {
    const match = calculateMatchScore(transaction, invoice);
    if (match && match.score >= BANKING.MATCH_SUGGEST_THRESHOLD) {
      candidates.push(match);
    }
  }

  if (candidates.length === 0) {
    return;
  }

  candidates.sort((a, b) => b.score - a.score);
  const bestMatch = candidates[0];

  if (bestMatch.score >= BANKING.MATCH_AUTO_THRESHOLD) {
    await prisma.bankTransaction.update({
      where: { id: transactionId },
      data: {
        status: "AUTO_MATCHED",
        matchedInvoiceId: bestMatch.invoiceId,
        matchConfidence: bestMatch.score,
      },
    });

    try {
      await recordPayment(bestMatch.invoiceId, userId, {
        amount: transaction.amount,
        method: "BANK_TRANSFER",
        note: `Auto-matched bank transaction: ${transaction.description}`,
        paidAt: transaction.madeOn,
      });
    } catch (error) {
      await prisma.bankTransaction.update({
        where: { id: transactionId },
        data: {
          status: "PENDING",
          matchedInvoiceId: null,
          matchConfidence: null,
        },
      });
      throw error;
    }
  } else {
    await prisma.bankTransaction.update({
      where: { id: transactionId },
      data: {
        matchedInvoiceId: bestMatch.invoiceId,
        matchConfidence: bestMatch.score,
      },
    });
  }
}

export async function confirmMatch(transactionId: string, invoiceId: string, userId: string) {
  const transaction = await prisma.bankTransaction.findFirst({
    where: { id: transactionId },
    include: { account: { include: { connection: true } } },
  });

  if (!transaction || transaction.account.connection.userId !== userId) {
    return null;
  }

  if (transaction.status !== "PENDING" && transaction.status !== "AUTO_MATCHED") {
    return null;
  }

  const alreadyPaid = transaction.status === "AUTO_MATCHED";

  await prisma.bankTransaction.update({
    where: { id: transactionId },
    data: {
      status: "CONFIRMED",
      matchedInvoiceId: invoiceId,
      matchConfidence: 1.0,
    },
  });

  try {
    if (!alreadyPaid) {
      await recordPayment(invoiceId, userId, {
        amount: transaction.amount,
        method: "BANK_TRANSFER",
        note: `Confirmed bank transaction: ${transaction.description}`,
        paidAt: transaction.madeOn,
      });
    }
  } catch (error) {
    await prisma.bankTransaction.update({
      where: { id: transactionId },
      data: {
        status: "PENDING",
        matchedInvoiceId: null,
        matchConfidence: null,
      },
    });
    throw error;
  }

  return { success: true };
}

export async function ignoreTransaction(transactionId: string, userId: string) {
  const transaction = await prisma.bankTransaction.findFirst({
    where: { id: transactionId },
    include: { account: { include: { connection: true } } },
  });

  if (!transaction || transaction.account.connection.userId !== userId) {
    return null;
  }

  await prisma.bankTransaction.update({
    where: { id: transactionId },
    data: {
      status: "IGNORED",
      matchedInvoiceId: null,
      matchConfidence: null,
    },
  });

  return { success: true };
}

export async function getPendingTransactions(userId: string) {
  return prisma.bankTransaction.findMany({
    where: {
      status: "PENDING",
      amount: { gt: 0 },
      matchConfidence: { gte: BANKING.MATCH_SUGGEST_THRESHOLD },
      account: {
        connection: { userId },
      },
    },
    include: {
      account: {
        include: { connection: true },
      },
      matchedInvoice: {
        include: { client: true },
      },
    },
    orderBy: { madeOn: "desc" },
  });
}

export async function getRecentAutoMatched(userId: string) {
  return prisma.bankTransaction.findMany({
    where: {
      status: "AUTO_MATCHED",
      account: {
        connection: { userId },
      },
    },
    include: {
      account: {
        include: { connection: true },
      },
      matchedInvoice: {
        include: { client: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}
