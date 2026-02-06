import { prisma } from "@app/server/db";
import * as saltEdge from "./salt-edge-client";
import { matchTransaction } from "./matching";

export async function syncTransactions(connectionId: string) {
  const connection = await prisma.bankConnection.findUniqueOrThrow({
    where: { id: connectionId },
    include: { accounts: true },
  });

  const fromDate = connection.lastSyncAt
    ? connection.lastSyncAt.toISOString().split("T")[0]
    : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  for (const account of connection.accounts) {
    const transactions = await saltEdge.getTransactions(
      connection.saltEdgeConnectionId,
      account.saltEdgeAccountId,
      fromDate
    );

    for (const tx of transactions) {
      const existing = await prisma.bankTransaction.findUnique({
        where: { saltEdgeId: tx.id },
      });

      if (existing) {
        continue;
      }

      const bankTransaction = await prisma.bankTransaction.create({
        data: {
          accountId: account.id,
          saltEdgeId: tx.id,
          amount: Math.round(tx.amount * 100),
          currencyCode: tx.currency_code,
          description: tx.description,
          madeOn: new Date(tx.made_on),
        },
      });

      if (bankTransaction.amount > 0) {
        await matchTransaction(bankTransaction.id, connection.userId);
      }
    }
  }

  await prisma.bankConnection.update({
    where: { id: connectionId },
    data: { lastSyncAt: new Date() },
  });
}

export async function syncConnectionForUser(connectionId: string, userId: string) {
  const connection = await prisma.bankConnection.findFirst({
    where: { id: connectionId, userId },
  });

  if (!connection) {
    return null;
  }

  await syncTransactions(connectionId);
  return { success: true };
}

export async function syncAllConnections(userId?: string) {
  const where = userId ? { userId, status: "active" } : { status: "active" };

  const connections = await prisma.bankConnection.findMany({ where });

  for (const connection of connections) {
    try {
      await syncTransactions(connection.id);
    } catch (error) {
      console.error(`Failed to sync connection ${connection.id}:`, error);

      await prisma.bankConnection.update({
        where: { id: connection.id },
        data: { status: "error" },
      });
    }
  }
}
