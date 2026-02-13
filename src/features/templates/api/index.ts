import { fetchApi } from "@app/shared/api/base";
import type { CreateTemplateInput, Template, UpdateTemplateInput } from "@app/shared/schemas";

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
