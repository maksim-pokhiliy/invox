import { z } from "zod";

export const paymentMethodSchema = z.enum(["STRIPE", "MANUAL"]);

export const recordPaymentSchema = z.object({
  amount: z.number().positive(),
  method: paymentMethodSchema,
  note: z.string().optional(),
  paidAt: z.string().optional(),
});

export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
