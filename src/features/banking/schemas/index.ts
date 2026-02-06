import { z } from "zod";

export const createConnectSessionSchema = z.object({
  returnUrl: z.string().url().optional(),
});

export const confirmMatchSchema = z.object({
  invoiceId: z.string().min(1),
});

export type CreateConnectSessionInput = z.infer<typeof createConnectSessionSchema>;
export type ConfirmMatchInput = z.infer<typeof confirmMatchSchema>;
