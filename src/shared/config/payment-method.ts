export const PAYMENT_METHOD = {
  MANUAL: "MANUAL",
  BANK_TRANSFER: "BANK_TRANSFER",
  CASH: "CASH",
  OTHER: "OTHER",
} as const;

export type PaymentMethodValue = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethodValue, string> = {
  MANUAL: "Manual",
  BANK_TRANSFER: "Bank Transfer",
  CASH: "Cash",
  OTHER: "Other",
};
