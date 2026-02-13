export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
} as const;

export const CACHE = {
  STALE_SHORT: 30 * TIME.SECOND,
  STALE_MEDIUM: TIME.MINUTE,
  STALE_LONG: 5 * TIME.MINUTE,
  GC_TIME: 5 * TIME.MINUTE,
} as const;

export const CURRENCY = {
  CENTS_MULTIPLIER: 100,
} as const;

export const NANOID = {
  PUBLIC_ID_LENGTH: 10,
} as const;

export const INVOICE = {
  DEFAULT_DUE_DAYS: 30,
  MAX_TAX_RATE: 100,
  MIN_TAX_RATE: 0,
} as const;

export const AUTH = {
  STATE_MAX_AGE: 10 * TIME.MINUTE,
  BCRYPT_ROUNDS: 12,
} as const;

export const EDITIONS = ["community", "pro"] as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100] as const,
} as const;

export const SEARCH = {
  DEBOUNCE_MS: 300,
} as const;

export const VALIDATION = {
  MAX_DUE_DAYS: 365,
  STATE_LENGTH: 16,
  MAX_PREFIX_LENGTH: 10,
  MAX_FOOTER_TEXT_LENGTH: 500,
  FOOTER_MIN_ROWS: 2,
  FOOTER_MAX_ROWS: 4,
} as const;

export const AUTOSAVE = {
  DELAY_MS: 2000,
} as const;

export const SORT_ORDER = {
  GAP: 10,
} as const;

export const REMINDER_MODE = {
  AFTER_SENT: "AFTER_SENT",
  AFTER_DUE: "AFTER_DUE",
} as const;

export type ReminderModeValue = (typeof REMINDER_MODE)[keyof typeof REMINDER_MODE];

export const REMINDER = {
  DEFAULT_DAYS: [1, 3, 7] as const,
  MAX_DAYS: 90,
  MIN_DAYS: 1,
  MAX_REMINDER_COUNT: 5,
} as const;

export type FormMode = "create" | "edit";

export {
  BANKING,
  CALLBACK_STAGE,
  type CallbackStageValue,
  CONNECTION_STATUS,
  type ConnectionStatusValue,
  TRANSACTION_STATUS,
  type TransactionStatusValue,
} from "./banking";
export { BRANDING, EMAIL, FONT_FAMILY_MAP } from "./email";
export { PAYMENT_METHOD, PAYMENT_METHOD_LABELS, type PaymentMethodValue } from "./payment-method";
export { SHORTCUTS, STORAGE_KEYS } from "./shortcuts";
export { TIME_TRACKING } from "./time-tracking";
export { ANIMATION, CHART, RESPONSIVE_SX, UI, VIRTUALIZATION } from "./ui";
