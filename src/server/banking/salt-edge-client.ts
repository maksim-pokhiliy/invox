import { BANKING } from "@app/shared/config/config";

const APP_ID = process.env.SALT_EDGE_APP_ID ?? "";
const SECRET = process.env.SALT_EDGE_SECRET ?? "";
const BASE_URL = process.env.SALT_EDGE_BASE_URL || BANKING.SALT_EDGE_BASE_URL;

interface SaltEdgeResponse<T> {
  data: T;
}

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
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "App-id": APP_ID,
      Secret: SECRET,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Salt Edge API error ${response.status}: ${errorBody}`);
  }

  return response.json() as Promise<T>;
}

export async function createCustomer(identifier: string): Promise<string> {
  const result = await saltEdgeFetch<SaltEdgeResponse<SaltEdgeCustomer>>("/customers", {
    method: "POST",
    body: JSON.stringify({ data: { identifier } }),
  });
  return result.data.customer_id;
}

export async function createConnectSession(
  customerId: string,
  returnUrl: string
): Promise<SaltEdgeConnectSession> {
  const result = await saltEdgeFetch<SaltEdgeResponse<SaltEdgeConnectSession>>(
    "/connections/connect",
    {
      method: "POST",
      body: JSON.stringify({
        data: {
          customer_id: customerId,
          consent: {
            scopes: ["accounts", "transactions"],
            from_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          },
          attempt: {
            return_to: returnUrl,
          },
        },
      }),
    }
  );
  return result.data;
}

export async function getConnection(connectionId: string): Promise<SaltEdgeConnection> {
  const result = await saltEdgeFetch<SaltEdgeResponse<SaltEdgeConnection>>(
    `/connections/${connectionId}`
  );
  return result.data;
}

export async function getAccounts(connectionId: string): Promise<SaltEdgeAccount[]> {
  const result = await saltEdgeFetch<SaltEdgeResponse<SaltEdgeAccount[]>>(
    `/accounts?connection_id=${connectionId}`
  );
  return result.data;
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

  const result = await saltEdgeFetch<SaltEdgeResponse<SaltEdgeTransaction[]>>(
    `/transactions?${params.toString()}`
  );
  return result.data;
}

export async function listConnections(customerId: string): Promise<SaltEdgeConnection[]> {
  const result = await saltEdgeFetch<SaltEdgeResponse<SaltEdgeConnection[]>>(
    `/connections?customer_id=${customerId}`
  );
  return result.data;
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
