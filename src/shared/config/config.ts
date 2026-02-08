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

export const NANOID = {
  PUBLIC_ID_LENGTH: 10,
} as const;

export const CURRENCY = {
  CENTS_MULTIPLIER: 100,
} as const;

export const BANKING = {
  SALT_EDGE_BASE_URL: "https://www.saltedge.com/api/v6",
  SYNC_INTERVAL_MINUTES: 30,
  MATCH_AUTO_THRESHOLD: 0.9,
  MATCH_SUGGEST_THRESHOLD: 0.5,
  MATCH_SCORE_CURRENCY: 0.1,
  MATCH_SCORE_REFERENCE: 0.5,
  MATCH_SCORE_AMOUNT: 0.3,
  MATCH_SCORE_DATE: 0.05,
  MATCH_AMOUNT_TOLERANCE: 0.01,
  PAYMENT_REFERENCE_LENGTH: 6,
  PAYMENT_REFERENCE_PREFIX: "INV",
  TRANSACTIONS_PER_PAGE: 1000,
  TRANSACTION_HISTORY_DAYS: 90,
  POPUP_WIDTH: 600,
  POPUP_HEIGHT: 700,
  CONNECT_SUCCESS_DELAY: 1500,
  CONNECT_ERROR_DELAY: 3000,
} as const;

export const SEARCH = {
  DEBOUNCE_MS: 300,
} as const;

export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  STAGGER: 50,
} as const;

export const SHORTCUTS = {
  COMMAND_PALETTE: {
    key: "k",
    ctrl: true,
    keys: ["Ctrl", "K"],
    description: "Open command palette",
    group: "General",
  },
  SHORTCUTS_DIALOG: {
    key: "?",
    keys: ["?"],
    description: "Show keyboard shortcuts",
    group: "General",
  },
  NEW_INVOICE: {
    key: "n",
    ctrl: true,
    keys: ["Ctrl", "N"],
    description: "Create new invoice",
    group: "Actions",
  },
  GO_DASHBOARD: {
    key: "d",
    ctrl: true,
    shift: true,
    keys: ["Ctrl", "Shift", "D"],
    description: "Go to dashboard",
    group: "Navigation",
  },
  GO_INVOICES: {
    key: "g",
    ctrl: true,
    shift: true,
    keys: ["Ctrl", "Shift", "G"],
    description: "Go to invoices",
    group: "Navigation",
  },
  GO_CLIENTS: {
    key: "c",
    ctrl: true,
    shift: true,
    keys: ["Ctrl", "Shift", "C"],
    description: "Go to clients",
    group: "Navigation",
  },
  GO_TEMPLATES: {
    key: "t",
    ctrl: true,
    shift: true,
    keys: ["Ctrl", "Shift", "T"],
    description: "Go to templates",
    group: "Navigation",
  },
  GO_RECURRING: {
    key: "r",
    ctrl: true,
    shift: true,
    keys: ["Ctrl", "Shift", "R"],
    description: "Go to recurring",
    group: "Navigation",
  },
  GO_SETTINGS: {
    key: "s",
    ctrl: true,
    shift: true,
    keys: ["Ctrl", "Shift", "S"],
    description: "Go to settings",
    group: "Navigation",
  },
  CLOSE: { key: "Escape", keys: ["Esc"], description: "Close dialog", group: "General" },
} as const;

export const STORAGE_KEYS = {
  RECENT_ITEMS: "invox-recent-items",
  INVOICE_DRAFT: "invoice-draft-new",
  ONBOARDING_DISMISSED: "invox-onboarding-dismissed",
  THEME_MODE: "theme-mode",
} as const;

export const EMAIL = {
  PRIMARY_COLOR: "#1976d2",
  OVERDUE_COLOR: "#d32f2f",
  MAX_WIDTH: 600,
  BUTTON_PADDING: "12px 24px",
  BUTTON_BORDER_RADIUS: "4px",
} as const;

export const BRANDING: {
  readonly DEFAULT_PRIMARY_COLOR: string;
  readonly DEFAULT_ACCENT_COLOR: string;
  readonly DEFAULT_CURRENCY: string;
} = {
  DEFAULT_PRIMARY_COLOR: "#1976d2",
  DEFAULT_ACCENT_COLOR: "#9c27b0",
  DEFAULT_CURRENCY: "USD",
};

export const CHART = {
  HEIGHT: 320,
  BAR_RADIUS: [4, 4, 0, 0] as [number, number, number, number],
  TOOLTIP_BORDER_RADIUS: 8,
  GRID_DASH: "3 3",
  TOOLTIP_SHADOW: "0 4px 12px rgba(0,0,0,0.1)",
} as const;

export const UI = {
  ALPHA_HOVER: 0.04,
  ALPHA_LIGHT: 0.02,
  ALPHA_MEDIUM: 0.08,
  ALPHA_MUTED: 0.1,
  ALPHA_BORDER: 0.2,
  ALPHA_OVERLAY: 0.5,
  SIDEBAR_WIDTH: 260,
  TOP_BAR_HEIGHT: 56,
  DRAWER_WIDTH: 280,
  MENU_MIN_WIDTH: 180,
  HEADER_HEIGHT: 80,
  HEADER_TOTAL_HEIGHT: 112,
  TOAST_MIN_WIDTH: 300,
  TOAST_DURATION_DEFAULT: 5000,
  TOAST_DURATION_LONG: 8000,
  TOAST_OFFSET: 80,
  MAX_VISIBLE_TOASTS: 5,
  PAGE_TRANSITION_DURATION: 300,
  PROGRESS_BAR_HEIGHT: 6,
  TOTALS_MIN_WIDTH: 280,
  EMPTY_STATE_ICON_SIZE: 64,
  METRIC_ICON_SIZE: 44,
  COMMAND_PALETTE_MAX_HEIGHT: 400,
  FILTER_DRAWER_MAX_HEIGHT: "80vh",
  FILTER_DRAWER_HANDLE_WIDTH: 40,
  FILTER_DRAWER_HANDLE_HEIGHT: 4,
} as const;
