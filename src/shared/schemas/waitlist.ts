import { z } from "zod";

export const waitlistSchema = z.object({
  email: z.email("Invalid email address"),
});

export type WaitlistInput = z.infer<typeof waitlistSchema>;

export const WAITLIST_STATUS = {
  APPROVED: "approved",
  PENDING: "pending",
  NOT_FOUND: "not_found",
} as const;

export type WaitlistCheckStatus = (typeof WAITLIST_STATUS)[keyof typeof WAITLIST_STATUS];

export interface WaitlistCheckResponse {
  status: WaitlistCheckStatus;
}
