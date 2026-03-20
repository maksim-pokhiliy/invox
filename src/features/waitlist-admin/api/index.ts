import { fetchApi } from "@app/shared/api/base";

export interface WaitlistEntry {
  id: string;
  email: string;
  status: "PENDING" | "APPROVED";
  createdAt: string;
  updatedAt: string;
}

export const waitlistAdminApi = {
  list: () => fetchApi<WaitlistEntry[]>("/api/waitlist/list"),

  approve: (email: string) =>
    fetchApi<{ message: string }>("/api/waitlist/approve", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  delete: (id: string) =>
    fetchApi<{ success: boolean }>(`/api/waitlist/${id}`, {
      method: "DELETE",
    }),
};
