import { createTheme } from "@mui/material/styles";

import { brand, sharedComponents, typography } from "./theme-base";

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#4338ca",
      light: brand.primaryLight,
      dark: "#3730a3",
      contrastText: "#fff",
    },
    secondary: {
      main: "#047857",
      light: brand.secondaryLight,
      dark: "#065f46",
      contrastText: "#fff",
    },
    error: { main: "#dc2626", contrastText: "#fff" },
    warning: { main: "#d97706", contrastText: "#fff" },
    info: { main: "#2563eb", contrastText: "#fff" },
    success: { main: "#047857", contrastText: "#fff" },
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
    text: {
      primary: "#0f172a",
      secondary: "#64748b",
    },
    divider: "rgba(148,163,184,0.2)",
  },
  typography,
  shape: {
    borderRadius: 10,
  },
  components: {
    ...sharedComponents,
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 14,
        },
        elevation1: {
          boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
          border: "1px solid rgba(148,163,184,0.2)",
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
          border: "1px solid rgba(148,163,184,0.2)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
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
          color: "#64748b",
        },
      },
    },
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
      main: "#818cf8",
      light: "#c7d2fe",
      dark: brand.primaryLight,
      contrastText: "#0f172a",
    },
    secondary: {
      main: "#6ee7b7",
      light: "#a7f3d0",
      dark: brand.secondaryLight,
      contrastText: "#0f172a",
    },
    error: { main: "#f87171", contrastText: "#0f172a" },
    warning: { main: "#fbbf24", contrastText: "#0f172a" },
    info: { main: "#60a5fa", contrastText: "#0f172a" },
    success: { main: "#4ade80", contrastText: "#0f172a" },
    background: {
      default: "#0c1222",
      paper: "#162032",
    },
    text: {
      primary: "#f8fafc",
      secondary: "#94a3b8",
    },
    divider: "rgba(148,163,184,0.12)",
  },
  typography,
  shape: {
    borderRadius: 10,
  },
  components: {
    ...sharedComponents,
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          backgroundImage: "none",
        },
        elevation1: {
          boxShadow: "0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)",
          border: "1px solid rgba(148,163,184,0.12)",
        },
        elevation2: {
          boxShadow: "0 4px 6px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          border: "1px solid rgba(148,163,184,0.12)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)",
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
          color: "#94a3b8",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#162032",
          color: "#f1f5f9",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          boxShadow: "0 4px 16px rgba(0,0,0,0.3), 0 1px 4px rgba(0,0,0,0.2)",
        },
      },
    },
  },
});
