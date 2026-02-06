import { fetchApi } from "@app/shared/api/base";

export interface BankAccountData {
  id: string;
  name: string;
  nature: string;
  balance: number;
  currencyCode: string;
}

export interface BankConnectionData {
  id: string;
  provider: string;
  providerName: string;
  country: string;
  status: string;
  lastSyncAt: string | null;
  createdAt: string;
  accounts: BankAccountData[];
}

export interface MatchedInvoiceData {
  id: string;
  publicId: string;
  total: number;
  currency: string;
  status: string;
  paymentReference: string | null;
  client: {
    name: string;
    email: string;
  };
}

export interface BankTransactionData {
  id: string;
  amount: number;
  currencyCode: string;
  description: string;
  madeOn: string;
  status: string;
  matchConfidence: number | null;
  matchedInvoice: MatchedInvoiceData | null;
  account: {
    name: string;
    connection: {
      providerName: string;
    };
  };
}

export interface TransactionsResponse {
  pending: BankTransactionData[];
  autoMatched: BankTransactionData[];
}

export const bankingApi = {
  getConnections: () => fetchApi<BankConnectionData[]>("/api/banking/connections"),

  createConnectSession: (returnUrl?: string) =>
    fetchApi<{ connectUrl: string }>("/api/banking/connections", {
      method: "POST",
      body: JSON.stringify({ returnUrl }),
    }),

  deleteConnection: (id: string) =>
    fetchApi<{ success: boolean }>(`/api/banking/connections/${id}`, {
      method: "DELETE",
    }),

  syncConnection: (id: string) =>
    fetchApi<{ success: boolean }>(`/api/banking/connections/${id}/sync`, {
      method: "POST",
    }),

  getTransactions: () => fetchApi<TransactionsResponse>("/api/banking/transactions"),

  confirmMatch: (transactionId: string, invoiceId: string) =>
    fetchApi<{ success: boolean }>(`/api/banking/transactions/${transactionId}/confirm`, {
      method: "POST",
      body: JSON.stringify({ invoiceId }),
    }),

  ignoreTransaction: (transactionId: string) =>
    fetchApi<{ success: boolean }>(`/api/banking/transactions/${transactionId}/ignore`, {
      method: "POST",
    }),

  completeConnection: () =>
    fetchApi<{ discovered: number }>("/api/banking/connections/complete", {
      method: "POST",
    }),
};
