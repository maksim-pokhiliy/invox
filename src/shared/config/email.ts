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
  readonly DEFAULT_INVOICE_PREFIX: string;
} = {
  DEFAULT_PRIMARY_COLOR: "#1976d2",
  DEFAULT_ACCENT_COLOR: "#9c27b0",
  DEFAULT_CURRENCY: "USD",
  DEFAULT_INVOICE_PREFIX: "INV",
};

export const FONT_FAMILY_MAP: Record<string, string> = {
  system: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  serif: "Georgia, 'Times New Roman', Times, serif",
  mono: "'Courier New', Courier, monospace",
};
