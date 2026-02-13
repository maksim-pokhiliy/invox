import { fetchApi } from "@app/shared/api/base";
import type {
  CreateRecurringInput,
  RecurringInvoice,
  UpdateRecurringInput,
} from "@app/shared/schemas";

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
