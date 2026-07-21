import { fetchApi } from "@app/shared/api/base";
import type { CreateServiceInput, UpdateServiceInput } from "@app/shared/schemas";
import {
  type Service,
  serviceListSchema,
  serviceSchema,
  successAckSchema,
} from "@app/shared/schemas/api";

export const servicesApi = {
  list: () => fetchApi<Service[]>("/api/services", undefined, serviceListSchema),

  get: (id: string) => fetchApi<Service>(`/api/services/${id}`, undefined, serviceSchema),

  create: (data: CreateServiceInput) =>
    fetchApi<Service>(
      "/api/services",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      serviceSchema
    ),

  update: (id: string, data: UpdateServiceInput) =>
    fetchApi<Service>(
      `/api/services/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
      serviceSchema
    ),

  delete: (id: string) =>
    fetchApi<{ success: boolean }>(
      `/api/services/${id}`,
      {
        method: "DELETE",
      },
      successAckSchema
    ),
};
