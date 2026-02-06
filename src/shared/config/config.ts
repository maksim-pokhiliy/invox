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

export const INVOICE = {
  DEFAULT_DUE_DAYS: 30,
  MAX_TAX_RATE: 100,
  MIN_TAX_RATE: 0,
} as const;

export const AUTOSAVE = {
  DELAY_MS: 2000,
} as const;

export const AUTH = {
  STATE_MAX_AGE: 10 * TIME.MINUTE,
  BCRYPT_ROUNDS: 12,
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100] as const,
} as const;

export const VIRTUALIZATION = {
  ROW_HEIGHT: 65,
} as const;

export const REMINDER = {
  DEFAULT_DAYS: [1, 3, 7] as const,
  MAX_DAYS: 90,
  MIN_DAYS: 1,
  MAX_REMINDER_COUNT: 5,
} as const;

export const VALIDATION = {
  MAX_DUE_DAYS: 365,
  STATE_LENGTH: 16,
} as const;

export const BANKING = {
  SALT_EDGE_BASE_URL: "https://www.saltedge.com/api/v6",
  SYNC_INTERVAL_MINUTES: 30,
  MATCH_AUTO_THRESHOLD: 0.9,
  MATCH_SUGGEST_THRESHOLD: 0.5,
  PAYMENT_REFERENCE_LENGTH: 6,
  PAYMENT_REFERENCE_PREFIX: "INV",
  TRANSACTIONS_PER_PAGE: 1000,
} as const;

export const UI = {
  ALPHA_HOVER: 0.04,
  ALPHA_LIGHT: 0.02,
  ALPHA_MEDIUM: 0.08,
  ALPHA_MUTED: 0.1,
  ALPHA_BORDER: 0.2,
  ALPHA_OVERLAY: 0.5,
  DRAWER_WIDTH: 280,
  MENU_MIN_WIDTH: 180,
  HEADER_HEIGHT: 80,
  TOAST_MIN_WIDTH: 300,
  TOAST_DURATION_DEFAULT: 5000,
  PAGE_TRANSITION_DURATION: 300,
} as const;
