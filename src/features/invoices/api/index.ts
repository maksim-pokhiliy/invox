import { fetchApi } from "@app/shared/api/base";
import type { CreateInvoiceInput, UpdateInvoiceInput } from "@app/shared/schemas";
import type { Invoice, InvoiceListItem, Payment } from "@app/shared/schemas/api";
import type { RecordPaymentInput } from "@app/shared/schemas/payment";

export type { Payment, RecordPaymentInput };

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
