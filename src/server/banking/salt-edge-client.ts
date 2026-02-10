import { BANKING, TIME } from "@app/shared/config/config";
import { env } from "@app/shared/config/env";

interface SaltEdgeCustomer {
  customer_id: string;
  identifier: string;
}

interface SaltEdgeConnectSession {
  connect_url: string;
  expires_at: string;
}

interface SaltEdgeConnection {
  id: string;
  provider_code: string;
  provider_name: string;
  country_code: string;
  status: string;
  last_success_at: string | null;
}

interface SaltEdgeAccount {
  id: string;
  connection_id: string;
  name: string;
  nature: string;
  balance: number;
  currency_code: string;
}

interface SaltEdgeTransaction {
  id: string;
  account_id: string;
  amount: number;
  currency_code: string;
  description: string;
  made_on: string;
  status: string;
}

async function saltEdgeFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${env.SALT_EDGE_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "App-id": env.SALT_EDGE_APP_ID ?? "",
      Secret: env.SALT_EDGE_SECRET ?? "",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Salt Edge API error ${response.status}: ${errorBody}`);
  }

  const json: unknown = await response.json();

  if (json !== null && typeof json === "object" && "data" in json) {
    return (json as { data: T }).data;
  }

  return json as T;
}

export async function createCustomer(identifier: string): Promise<string> {
  const result = await saltEdgeFetch<SaltEdgeCustomer>("/customers", {
    method: "POST",
    body: JSON.stringify({ data: { identifier } }),
  });
  return result.customer_id;
}

export async function createConnectSession(
  customerId: string,
  returnUrl: string
): Promise<SaltEdgeConnectSession> {
  const payload = JSON.stringify({
    data: {
      customer_id: "__CUSTOMER_ID__",
      consent: {
        scopes: ["accounts", "transactions"],
        from_date: new Date(Date.now() - BANKING.TRANSACTION_HISTORY_DAYS * TIME.DAY)
          .toISOString()
          .split("T")[0],
      },
      attempt: {
        return_to: returnUrl,
      },
    },
  }).replace('"__CUSTOMER_ID__"', customerId);

  return saltEdgeFetch<SaltEdgeConnectSession>("/connections/connect", {
    method: "POST",
    body: payload,
  });
}

export async function getConnection(connectionId: string): Promise<SaltEdgeConnection> {
  return saltEdgeFetch<SaltEdgeConnection>(`/connections/${connectionId}`);
}

export async function getAccounts(connectionId: string): Promise<SaltEdgeAccount[]> {
  return saltEdgeFetch<SaltEdgeAccount[]>(`/accounts?connection_id=${connectionId}`);
}

export async function getTransactions(
  connectionId: string,
  accountId: string,
  fromDate?: string
): Promise<SaltEdgeTransaction[]> {
  const params = new URLSearchParams({
    connection_id: connectionId,
    account_id: accountId,
  });
  if (fromDate) {
    params.set("from_date", fromDate);
  }

  return saltEdgeFetch<SaltEdgeTransaction[]>(`/transactions?${params.toString()}`);
}

export async function listConnections(customerId: string): Promise<SaltEdgeConnection[]> {
  return saltEdgeFetch<SaltEdgeConnection[]>(`/connections?customer_id=${customerId}`);
}

export async function deleteConnection(connectionId: string): Promise<void> {
  await saltEdgeFetch(`/connections/${connectionId}`, {
    method: "DELETE",
  });
}

export async function refreshConnection(connectionId: string): Promise<void> {
  await saltEdgeFetch(`/connections/${connectionId}/refresh`, {
    method: "PUT",
  });
}

export type {
  SaltEdgeCustomer,
  SaltEdgeConnectSession,
  SaltEdgeConnection,
  SaltEdgeAccount,
  SaltEdgeTransaction,
};
