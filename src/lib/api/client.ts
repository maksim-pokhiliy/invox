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

export const authApi = {
  signUp: (data: SignUpInput) =>
    fetchApi<{ message: string }>("/api/auth/sign-up", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

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

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: "STRIPE" | "MANUAL";
  note: string | null;
  paidAt: string;
  createdAt: string;
}

export interface RecordPaymentInput {
  amount: number;
  method: "STRIPE" | "MANUAL";
  note?: string;
  paidAt?: string;
}

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

  getPayments: (invoiceId: string) => fetchApi<Payment[]>(`/api/invoices/${invoiceId}/payments`),

  recordPayment: (invoiceId: string, data: RecordPaymentInput) =>
    fetchApi<Invoice>(`/api/invoices/${invoiceId}/payments`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  deletePayment: (invoiceId: string, paymentId: string) =>
    fetchApi<Invoice>(`/api/invoices/${invoiceId}/payments?paymentId=${paymentId}`, {
      method: "DELETE",
    }),
};

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

export interface CurrencyMetrics {
  totalRevenue: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  outstandingBalance: number;
  overdueAmount: number;
  monthlyRevenue: { month: string; revenue: number }[];
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
  recentInvoices: {
    id: string;
    publicId: string;
    status: string;
    total: number;
    currency: string;
    clientName: string;
    createdAt: string;
  }[];
}

export const analyticsApi = {
  get: () => fetchApi<AnalyticsData>("/api/analytics"),
};

export interface TemplateItem {
  id: string;
  templateId: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Template {
  id: string;
  name: string;
  description: string | null;
  currency: string;
  discountType: "PERCENTAGE" | "FIXED" | null;
  discountValue: number;
  taxRate: number;
  notes: string | null;
  dueDays: number;
  createdAt: string;
  updatedAt: string;
  items: TemplateItem[];
}

export interface CreateTemplateInput {
  name: string;
  description?: string;
  currency?: string;
  discount?: {
    type: "PERCENTAGE" | "FIXED";
    value: number;
  };
  taxRate?: number;
  notes?: string;
  dueDays?: number;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
  }[];
}

export interface UpdateTemplateInput {
  name?: string;
  description?: string;
  currency?: string;
  discount?: {
    type: "PERCENTAGE" | "FIXED";
    value: number;
  } | null;
  taxRate?: number;
  notes?: string;
  dueDays?: number;
  items?: {
    description: string;
    quantity: number;
    unitPrice: number;
  }[];
}

export interface ReminderSettings {
  enabled: boolean;
  mode: "AFTER_SENT" | "AFTER_DUE";
  delaysDays: number[];
}

export const remindersApi = {
  get: () => fetchApi<ReminderSettings>("/api/reminders"),

  update: (data: ReminderSettings) =>
    fetchApi<ReminderSettings>("/api/reminders", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

export const templatesApi = {
  list: () => fetchApi<Template[]>("/api/templates"),

  get: (id: string) => fetchApi<Template>(`/api/templates/${id}`),

  create: (data: CreateTemplateInput) =>
    fetchApi<Template>("/api/templates", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateTemplateInput) =>
    fetchApi<Template>(`/api/templates/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<{ success: boolean }>(`/api/templates/${id}`, {
      method: "DELETE",
    }),
};

export const stripeApi = {
  disconnect: () =>
    fetchApi<{ success: boolean }>("/api/stripe/disconnect", {
      method: "POST",
    }),
};

export type RecurringFrequency = "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY";
export type RecurringStatus = "ACTIVE" | "PAUSED" | "CANCELED";

export interface RecurringInvoiceItem {
  id: string;
  recurringInvoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface RecurringInvoice {
  id: string;
  name: string;
  frequency: RecurringFrequency;
  status: RecurringStatus;
  currency: string;
  discountType: "PERCENTAGE" | "FIXED" | null;
  discountValue: number;
  taxRate: number;
  notes: string | null;
  dueDays: number;
  autoSend: boolean;
  nextRunAt: string;
  lastRunAt: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  client: {
    id: string;
    name: string;
    email: string;
  };
  items: RecurringInvoiceItem[];
}

export interface CreateRecurringInput {
  clientId: string;
  name: string;
  frequency: RecurringFrequency;
  currency?: string;
  discount?: {
    type: "PERCENTAGE" | "FIXED";
    value: number;
  };
  taxRate?: number;
  notes?: string;
  dueDays?: number;
  autoSend?: boolean;
  startDate: string;
  endDate?: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
  }[];
}

export interface UpdateRecurringInput {
  name?: string;
  frequency?: RecurringFrequency;
  status?: RecurringStatus;
  currency?: string;
  discount?: {
    type: "PERCENTAGE" | "FIXED";
    value: number;
  } | null;
  taxRate?: number;
  notes?: string;
  dueDays?: number;
  autoSend?: boolean;
  nextRunAt?: string;
  endDate?: string | null;
  items?: {
    description: string;
    quantity: number;
    unitPrice: number;
  }[];
}

export const recurringApi = {
  list: () => fetchApi<RecurringInvoice[]>("/api/recurring"),

  get: (id: string) => fetchApi<RecurringInvoice>(`/api/recurring/${id}`),

  create: (data: CreateRecurringInput) =>
    fetchApi<RecurringInvoice>("/api/recurring", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateRecurringInput) =>
    fetchApi<RecurringInvoice>(`/api/recurring/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<{ success: boolean }>(`/api/recurring/${id}`, {
      method: "DELETE",
    }),

  generate: (id: string) =>
    fetchApi<{ success: boolean; invoiceId: string; publicId: string }>(
      `/api/recurring/${id}/generate`,
      { method: "POST" }
    ),
};
