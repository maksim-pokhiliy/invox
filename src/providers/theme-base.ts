import { alpha } from "@mui/material/styles";

export const brand = {
  primary: "#4338ca",
  primaryLight: "#818cf8",
  primaryDark: "#3730a3",
  secondary: "#047857",
  secondaryLight: "#34d399",
  secondaryDark: "#065f46",
  accent: "#d97706",
  error: "#dc2626",
  warning: "#d97706",
  info: "#2563eb",
  success: "#047857",
};

export const typography = {
  fontFamily:
    '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  h1: {
    fontWeight: 800,
    fontSize: "2.5rem",
    lineHeight: 1.2,
    letterSpacing: "-0.025em",
  },
  h2: {
    fontWeight: 700,
    fontSize: "2rem",
    lineHeight: 1.3,
    letterSpacing: "-0.02em",
  },
  h3: {
    fontWeight: 700,
    fontSize: "1.5rem",
    lineHeight: 1.4,
    letterSpacing: "-0.015em",
  },
  h4: {
    fontWeight: 700,
    fontSize: "1.25rem",
    lineHeight: 1.4,
    letterSpacing: "-0.01em",
  },
  h5: {
    fontWeight: 600,
    fontSize: "1.125rem",
    lineHeight: 1.5,
  },
  h6: {
    fontWeight: 600,
    fontSize: "1rem",
    lineHeight: 1.5,
  },
  subtitle1: {
    fontSize: "1rem",
    fontWeight: 500,
    lineHeight: 1.5,
  },
  subtitle2: {
    fontSize: "0.875rem",
    fontWeight: 500,
    lineHeight: 1.5,
  },
  body1: {
    fontSize: "0.9375rem",
    lineHeight: 1.6,
  },
  body2: {
    fontSize: "0.8125rem",
    lineHeight: 1.6,
  },
  button: {
    fontWeight: 600,
    textTransform: "none" as const,
    letterSpacing: "0.01em",
  },
  caption: {
    fontSize: "0.75rem",
    lineHeight: 1.5,
  },
  overline: {
    fontSize: "0.75rem",
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
  },
};

export const sharedComponents = {
  MuiCssBaseline: {
    styleOverrides: {
      "*, *::before, *::after": {
        "&:focus-visible": {
          outline: `2px solid ${brand.primary}`,
          outlineOffset: "2px",
        },
      },
      "body:not(.user-is-tabbing) *:focus": {
        outline: "none",
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 10,
        padding: "10px 20px",
        fontSize: "0.9375rem",
        boxShadow: "none",
        "&:hover": {
          boxShadow: "none",
        },
        "&:focus-visible": {
          outline: `2px solid ${brand.primary}`,
          outlineOffset: "2px",
        },
      },
      sizeLarge: {
        padding: "12px 28px",
        fontSize: "1rem",
      },
      sizeSmall: {
        padding: "6px 14px",
        fontSize: "0.8125rem",
      },
      contained: {
        "&:hover": {
          boxShadow: `0 4px 12px ${alpha(brand.primary, 0.4)}`,
        },
      },
      outlined: {
        borderWidth: 1.5,
        "&:hover": {
          borderWidth: 1.5,
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 14,
      },
      elevation1: {
        boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
      },
      elevation2: {
        boxShadow: "0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)",
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 14,
        boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        "& .MuiOutlinedInput-root": {
          borderRadius: 10,
        },
      },
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: 10,
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        fontWeight: 500,
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      head: {
        fontWeight: 600,
        fontSize: "0.75rem",
        textTransform: "uppercase" as const,
        letterSpacing: "0.06em",
        color: "inherit",
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 18,
      },
    },
  },
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: 10,
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      },
    },
  },
  MuiMenu: {
    styleOverrides: {
      paper: {
        borderRadius: 12,
        boxShadow: "0 4px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.05)",
      },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        borderRadius: 8,
      },
    },
  },
};
