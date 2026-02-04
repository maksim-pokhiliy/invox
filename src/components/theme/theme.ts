import { createTheme, alpha } from "@mui/material/styles";

// Brand colors - WCAG AA compliant
const brand = {
  primary: "#4f46e5", // Indigo (darkened for better contrast)
  primaryLight: "#818cf8",
  primaryDark: "#3730a3",
  secondary: "#047857", // Emerald (darkened for better contrast)
  secondaryLight: "#34d399",
  secondaryDark: "#065f46",
  accent: "#d97706", // Amber (darkened for better contrast)
  error: "#dc2626",
  warning: "#d97706",
  info: "#2563eb",
  success: "#047857",
};

const typography = {
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  h1: {
    fontWeight: 700,
    fontSize: "2.5rem",
    lineHeight: 1.2,
    letterSpacing: "-0.02em",
  },
  h2: {
    fontWeight: 700,
    fontSize: "2rem",
    lineHeight: 1.3,
    letterSpacing: "-0.01em",
  },
  h3: {
    fontWeight: 600,
    fontSize: "1.5rem",
    lineHeight: 1.4,
  },
  h4: {
    fontWeight: 600,
    fontSize: "1.25rem",
    lineHeight: 1.4,
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
    fontSize: "1rem",
    lineHeight: 1.6,
  },
  body2: {
    fontSize: "0.875rem",
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

const sharedComponents = {
  MuiCssBaseline: {
    styleOverrides: {
      // Enhanced focus styles for keyboard navigation
      "*, *::before, *::after": {
        "&:focus-visible": {
          outline: `2px solid ${brand.primary}`,
          outlineOffset: "2px",
        },
      },
      // Hide focus ring for mouse users
      "body:not(.user-is-tabbing) *:focus": {
        outline: "none",
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
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
        borderRadius: 12,
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
        borderRadius: 12,
        boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        "& .MuiOutlinedInput-root": {
          borderRadius: 8,
        },
      },
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: 8,
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 6,
        fontWeight: 500,
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      head: {
        fontWeight: 600,
        fontSize: "0.8125rem",
        textTransform: "uppercase" as const,
        letterSpacing: "0.05em",
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 16,
      },
    },
  },
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: 8,
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
};

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#4f46e5", // Darker indigo for better contrast (WCAG AA compliant)
      light: brand.primaryLight,
      dark: "#3730a3",
      contrastText: "#fff",
    },
    secondary: {
      main: "#047857", // Darker emerald for better contrast
      light: brand.secondaryLight,
      dark: "#065f46",
      contrastText: "#fff",
    },
    error: { main: "#dc2626", contrastText: "#fff" }, // Darker red
    warning: { main: "#d97706", contrastText: "#fff" }, // Darker amber
    info: { main: "#2563eb", contrastText: "#fff" }, // Darker blue
    success: { main: "#047857", contrastText: "#fff" }, // Darker green
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
    text: {
      primary: "#0f172a", // Darker for better contrast
      secondary: "#475569", // Darker secondary text (WCAG AA compliant)
    },
    divider: "#cbd5e1", // Slightly darker divider for visibility
  },
  typography,
  shape: {
    borderRadius: 8,
  },
  components: {
    ...sharedComponents,
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          color: "#1e293b",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#a5b4fc", // Lighter indigo for dark mode
      light: "#c7d2fe",
      dark: brand.primaryLight,
      contrastText: "#0f172a",
    },
    secondary: {
      main: "#6ee7b7", // Lighter emerald for dark mode
      light: "#a7f3d0",
      dark: brand.secondaryLight,
      contrastText: "#0f172a",
    },
    error: { main: "#fca5a5", contrastText: "#0f172a" }, // Lighter red for dark bg
    warning: { main: "#fcd34d", contrastText: "#0f172a" }, // Lighter amber
    info: { main: "#93c5fd", contrastText: "#0f172a" }, // Lighter blue
    success: { main: "#6ee7b7", contrastText: "#0f172a" }, // Lighter green
    background: {
      default: "#0f172a",
      paper: "#1e293b",
    },
    text: {
      primary: "#f8fafc", // Slightly brighter
      secondary: "#cbd5e1", // Lighter secondary for better contrast on dark bg
    },
    divider: "#475569", // More visible divider
  },
  typography,
  shape: {
    borderRadius: 8,
  },
  components: {
    ...sharedComponents,
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#1e293b",
          color: "#f1f5f9",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundImage: "none",
        },
        elevation1: {
          boxShadow: "0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)",
        },
        elevation2: {
          boxShadow: "0 4px 6px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)",
        },
      },
    },
  },
});
