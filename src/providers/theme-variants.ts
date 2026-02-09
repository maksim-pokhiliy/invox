import { createTheme } from "@mui/material/styles";

import { brand, sharedComponents, typography } from "./theme-base";
import { UI } from "@app/shared/config/config";

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: brand.primary,
      light: brand.primaryLight,
      dark: brand.primaryDark,
      contrastText: "#fff",
    },
    secondary: {
      main: brand.secondary,
      light: brand.secondaryLight,
      dark: brand.secondaryDark,
      contrastText: "#fff",
    },
    error: { main: brand.error, contrastText: "#fff" },
    warning: { main: brand.warning, contrastText: "#fff" },
    info: { main: brand.info, contrastText: "#fff" },
    success: { main: brand.success, contrastText: "#fff" },
    background: {
      default: "#f8f9fb",
      paper: "#ffffff",
    },
    text: {
      primary: "#111827",
      secondary: "#6b7280",
    },
    divider: "rgba(107,114,128,0.15)",
  },
  typography,
  shape: {
    borderRadius: UI.BORDER_RADIUS_SM,
  },
  components: {
    ...sharedComponents,
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: UI.BORDER_RADIUS_LG,
        },
        elevation1: {
          boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
          border: "1px solid rgba(107,114,128,0.12)",
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
          border: "1px solid rgba(107,114,128,0.12)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          fontSize: "0.8125rem",
          color: "#6b7280",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          color: "#1f2937",
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
      main: brand.primaryLight,
      light: "#5eead4",
      dark: brand.primary,
      contrastText: "#111827",
    },
    secondary: {
      main: brand.secondaryLight,
      light: "#c7d2fe",
      dark: brand.secondary,
      contrastText: "#111827",
    },
    error: { main: "#f87171", contrastText: "#111827" },
    warning: { main: "#fbbf24", contrastText: "#111827" },
    info: { main: "#60a5fa", contrastText: "#111827" },
    success: { main: "#4ade80", contrastText: "#111827" },
    background: {
      default: "#0f1214",
      paper: "#1a1f25",
    },
    text: {
      primary: "#f3f4f6",
      secondary: "#9ca3af",
    },
    divider: "rgba(156,163,175,0.16)",
  },
  typography,
  shape: {
    borderRadius: UI.BORDER_RADIUS_SM,
  },
  components: {
    ...sharedComponents,
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: UI.BORDER_RADIUS_LG,
          backgroundImage: "none",
        },
        elevation1: {
          boxShadow: "0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)",
          border: "1px solid rgba(156,163,175,0.16)",
        },
        elevation2: {
          boxShadow: "0 4px 6px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: UI.BORDER_RADIUS_LG,
          border: "1px solid rgba(156,163,175,0.16)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          fontSize: "0.8125rem",
          color: "#9ca3af",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#1a1f25",
          color: "#f3f4f6",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: UI.BORDER_RADIUS_MD,
          boxShadow: "0 4px 16px rgba(0,0,0,0.3), 0 1px 4px rgba(0,0,0,0.2)",
        },
      },
    },
  },
});
