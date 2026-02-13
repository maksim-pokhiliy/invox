import { alpha } from "@mui/material/styles";

import { ANIMATION, UI } from "@app/shared/config/config";

export const brand = {
  primary: "#0d9488",
  primaryLight: "#2dd4bf",
  primaryDark: "#0f766e",
  secondary: "#6366f1",
  secondaryLight: "#a5b4fc",
  secondaryDark: "#4338ca",
  accent: "#f97316",
  error: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",
  success: "#10b981",
};

export const typography = {
  fontFamily: '"Outfit", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  h1: {
    fontWeight: 800,
    fontSize: "2.25rem",
    lineHeight: 1.15,
    letterSpacing: "-0.025em",
    "@media (min-width:900px)": {
      fontSize: "3.5rem",
    },
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
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
  },
};

const transitionAll = `all ${ANIMATION.FAST}ms ease`;

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
  MuiButtonBase: {
    styleOverrides: {
      root: {
        transition: transitionAll,
        "&:active": {
          transform: `scale(${ANIMATION.BUTTON_PRESS_SCALE})`,
        },
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: UI.BORDER_RADIUS_SM,
        padding: "10px 20px",
        fontSize: "0.9375rem",
        boxShadow: "none",
        transition: transitionAll,
        "&:hover": {
          boxShadow: "none",
        },
        "&:active": {
          transform: `scale(${ANIMATION.BUTTON_PRESS_SCALE})`,
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
          boxShadow: `0 4px 14px ${alpha(brand.primary, 0.35)}`,
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
  MuiIconButton: {
    styleOverrides: {
      root: {
        transition: transitionAll,
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: UI.BORDER_RADIUS_LG,
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
        borderRadius: UI.BORDER_RADIUS_LG,
        boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        "& .MuiOutlinedInput-root": {
          borderRadius: UI.BORDER_RADIUS_SM,
          transition: transitionAll,
          "&.Mui-focused": {
            boxShadow: `0 0 0 ${UI.FOCUS_RING_WIDTH}px ${alpha(brand.primary, UI.ALPHA_FOCUS_RING)}`,
          },
        },
      },
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: UI.BORDER_RADIUS_SM,
        transition: transitionAll,
        "&.Mui-focused": {
          boxShadow: `0 0 0 ${UI.FOCUS_RING_WIDTH}px ${alpha(brand.primary, UI.ALPHA_FOCUS_RING)}`,
        },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: UI.BORDER_RADIUS_SM,
        fontWeight: 500,
        transition: transitionAll,
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      head: {
        fontWeight: 600,
        fontSize: "0.8125rem",
        color: "inherit",
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: UI.BORDER_RADIUS_XL,
      },
    },
  },
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: UI.BORDER_RADIUS_SM,
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
        borderRadius: UI.BORDER_RADIUS_MD,
        boxShadow: "0 4px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.05)",
      },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        borderRadius: UI.BORDER_RADIUS_SM,
      },
    },
  },
  MuiLink: {
    styleOverrides: {
      root: {
        transition: transitionAll,
      },
    },
  },
  MuiLinearProgress: {
    styleOverrides: {
      root: {
        borderRadius: 999,
      },
      bar: {
        borderRadius: 999,
      },
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: {
        transition: transitionAll,
      },
    },
  },
  MuiTableRow: {
    styleOverrides: {
      root: {
        transition: `background-color ${ANIMATION.FAST}ms ease`,
      },
    },
  },
};
