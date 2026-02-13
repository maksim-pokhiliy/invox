import { z } from "zod";

import { PAYMENT_METHOD } from "@app/shared/config/payment-method";

const paymentMethodSchema = z.nativeEnum(PAYMENT_METHOD);

export const recordPaymentSchema = z.object({
  amount: z.number().positive(),
  method: paymentMethodSchema,
  note: z.string().optional(),
  paidAt: z.string().optional(),
});

export const recordPaymentApiSchema = z.object({
  amount: z.number().positive(),
  method: paymentMethodSchema,
  note: z.string().optional(),
  paidAt: z.coerce.date().optional(),
});

export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
