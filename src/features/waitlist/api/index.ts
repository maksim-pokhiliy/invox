import { fetchApi } from "@app/shared/api/base";
import type { WaitlistCheckResponse, WaitlistInput } from "@app/shared/schemas";

export const waitlistApi = {
  join: (data: WaitlistInput) =>
    fetchApi<{ message: string }>("/api/waitlist", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  checkStatus: (data: WaitlistInput) =>
    fetchApi<WaitlistCheckResponse>("/api/waitlist/check", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
