import { CALLBACK_STAGE, CONNECTION_STATUS, CURRENCY } from "@app/shared/config/config";

import { prisma } from "@app/server/db";

import * as saltEdge from "./salt-edge-client";
import { syncTransactions } from "./sync";

interface CallbackBody {
  data: {
    connection_id: string;
    customer_id: string;
    stage: string;
  };
}

export async function ensureCustomer(userId: string): Promise<string> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  if (user.saltEdgeCustomerId) {
    return user.saltEdgeCustomerId;
  }

  const customerId = await saltEdge.createCustomer(`user_${userId}`);

  await prisma.user.update({
    where: { id: userId },
    data: { saltEdgeCustomerId: customerId },
  });

  return customerId;
}

export async function createConnectSession(userId: string, returnUrl: string) {
  const customerId = await ensureCustomer(userId);
  const session = await saltEdge.createConnectSession(customerId, returnUrl);

  return session;
}

export async function handleConnectionSuccess(saltEdgeConnectionId: string, userId: string) {
  const existing = await prisma.bankConnection.findUnique({
    where: { saltEdgeConnectionId },
  });

  if (existing) {
    return existing;
  }

  const connection = await saltEdge.getConnection(saltEdgeConnectionId);
  const accounts = await saltEdge.getAccounts(saltEdgeConnectionId);

  const bankConnection = await prisma.bankConnection.create({
    data: {
      userId,
      saltEdgeConnectionId,
      provider: connection.provider_code,
      providerName: connection.provider_name,
      country: connection.country_code,
      status: CONNECTION_STATUS.ACTIVE,
      accounts: {
        create: accounts.map((account) => ({
          saltEdgeAccountId: account.id,
          name: account.name,
          nature: account.nature,
          balance: Math.round(account.balance * CURRENCY.CENTS_MULTIPLIER),
          currencyCode: account.currency_code,
        })),
      },
    },
    include: { accounts: true },
  });

  return bankConnection;
}

export async function discoverNewConnections(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  if (!user.saltEdgeCustomerId) {
    return [];
  }

  const seConnections = await saltEdge.listConnections(user.saltEdgeCustomerId);

  const existingIds = new Set(
    (
      await prisma.bankConnection.findMany({
        where: { userId },
        select: { saltEdgeConnectionId: true },
      })
    ).map((c) => c.saltEdgeConnectionId)
  );

  const newConnections = seConnections.filter((c) => !existingIds.has(c.id));
  const saved = [];

  for (const conn of newConnections) {
    const bankConnection = await handleConnectionSuccess(conn.id, userId);

    saved.push(bankConnection);
  }

  return saved;
}

export async function getConnections(userId: string) {
  return prisma.bankConnection.findMany({
    where: { userId },
    include: {
      accounts: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteConnectionById(connectionId: string, userId: string) {
  const connection = await prisma.bankConnection.findFirst({
    where: { id: connectionId, userId },
  });

  if (!connection) {
    return null;
  }

  try {
    await saltEdge.deleteConnection(connection.saltEdgeConnectionId);
  } catch (error) {
    console.error("Failed to delete Salt Edge connection:", error);
  }

  await prisma.bankConnection.delete({
    where: { id: connectionId },
  });

  return { success: true };
}

export async function refreshConnectionById(connectionId: string, userId: string) {
  const connection = await prisma.bankConnection.findFirst({
    where: { id: connectionId, userId },
  });

  if (!connection) {
    return null;
  }

  await saltEdge.refreshConnection(connection.saltEdgeConnectionId);

  return { success: true };
}

export async function handleCallback(body: CallbackBody) {
  const data = body.data;

  if (!data?.connection_id || !data?.customer_id) {
    return;
  }

  const user = await prisma.user.findFirst({
    where: { saltEdgeCustomerId: data.customer_id },
  });

  if (!user) {
    console.error("Callback: user not found for customer", data.customer_id);

    return;
  }

  if (data.stage === CALLBACK_STAGE.FINISH) {
    const connection = await handleConnectionSuccess(data.connection_id, user.id);

    await syncTransactions(connection.id);
  }

  if (data.stage === CALLBACK_STAGE.ERROR) {
    const existing = await prisma.bankConnection.findUnique({
      where: { saltEdgeConnectionId: data.connection_id },
    });

    if (existing) {
      await prisma.bankConnection.update({
        where: { id: existing.id },
        data: { status: CONNECTION_STATUS.ERROR },
      });
    }
  }
}
