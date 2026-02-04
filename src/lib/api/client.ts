import type {
  Client,
  Invoice,
  InvoiceListItem,
  SenderProfile,
  PublicInvoice,
  CheckoutSession,
} from "@app/shared/schemas/api";
import type { CreateClientInput, UpdateClientInput } from "@app/shared/schemas/client";
import type { CreateInvoiceInput, UpdateInvoiceInput } from "@app/shared/schemas/invoice";
import type { SenderProfileInput } from "@app/shared/schemas/sender-profile";
import type { SignUpInput } from "@app/shared/schemas/auth";

// API Error class for consistent error handling
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Generic fetch wrapper with error handling
async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error?.code || "UNKNOWN_ERROR",
      data.error?.message || "An unexpected error occurred",
      response.status
    );
  }

  return data as T;
}

// Auth API
export const authApi = {
  signUp: (data: SignUpInput) =>
    fetchApi<{ message: string }>("/api/auth/sign-up", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// Clients API
export const clientsApi = {
  list: () => fetchApi<Client[]>("/api/clients"),

  get: (id: string) => fetchApi<Client>(`/api/clients/${id}`),

  create: (data: CreateClientInput) =>
    fetchApi<Client>("/api/clients", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateClientInput) =>
    fetchApi<Client>(`/api/clients/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<{ success: boolean }>(`/api/clients/${id}`, {
      method: "DELETE",
    }),
};

// Invoices API
export const invoicesApi = {
  list: () => fetchApi<InvoiceListItem[]>("/api/invoices"),

  get: (id: string) => fetchApi<Invoice>(`/api/invoices/${id}`),

  create: (data: CreateInvoiceInput) =>
    fetchApi<Invoice>("/api/invoices", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateInvoiceInput) =>
    fetchApi<Invoice>(`/api/invoices/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  send: (id: string) =>
    fetchApi<Invoice>(`/api/invoices/${id}/send`, {
      method: "POST",
    }),

  markPaid: (id: string) =>
    fetchApi<Invoice>(`/api/invoices/${id}/mark-paid`, {
      method: "POST",
    }),

  delete: (id: string) =>
    fetchApi<{ success: boolean }>(`/api/invoices/${id}`, {
      method: "DELETE",
    }),

  duplicate: (id: string) =>
    fetchApi<Invoice>(`/api/invoices/${id}/duplicate`, {
      method: "POST",
    }),
};

// Sender Profile API
export const senderProfileApi = {
  get: () => fetchApi<SenderProfile>("/api/sender-profile"),

  create: (data: SenderProfileInput) =>
    fetchApi<SenderProfile>("/api/sender-profile", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (data: SenderProfileInput) =>
    fetchApi<SenderProfile>("/api/sender-profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

// Public API (no auth required)
export const publicApi = {
  getInvoice: (publicId: string) => fetchApi<PublicInvoice>(`/api/public/invoices/${publicId}`),

  markViewed: (publicId: string) =>
    fetchApi<void>(`/api/public/invoices/${publicId}/viewed`, {
      method: "POST",
    }),

  createCheckoutSession: (invoiceId: string) =>
    fetchApi<CheckoutSession>("/api/stripe/create-checkout-session", {
      method: "POST",
      body: JSON.stringify({ invoiceId }),
    }),
};
