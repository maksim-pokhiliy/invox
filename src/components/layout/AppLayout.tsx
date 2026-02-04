"use client";

import * as React from "react";
import { Box, Container, Link } from "@mui/material";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface AppLayoutProps {
  children: React.ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false;
  disablePadding?: boolean;
}

// Header height (80px) + top padding (16px) + bottom padding (16px) = 112px = 14 spacing units
const HEADER_HEIGHT = 14;

function SkipLink() {
  return (
    <Link
      href="#main-content"
      sx={{
        position: "absolute",
        left: "-9999px",
        zIndex: 9999,
        padding: 2,
        bgcolor: "primary.main",
        color: "primary.contrastText",
        textDecoration: "none",
        fontWeight: 600,
        borderRadius: 1,
        "&:focus": {
          left: 16,
          top: 16,
        },
      }}
    >
      Skip to main content
    </Link>
  );
}

export function AppLayout({ children, maxWidth = "lg", disablePadding = false }: AppLayoutProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "background.default",
        pt: HEADER_HEIGHT,
      }}
    >
      <SkipLink />
      <Header />
      <Box
        component="main"
        id="main-content"
        tabIndex={-1}
        sx={{ flex: 1, py: disablePadding ? 0 : 4, px: 3, outline: "none" }}
      >
        {maxWidth ? (
          <Container maxWidth={maxWidth} disableGutters>
            {children}
          </Container>
        ) : (
          children
        )}
      </Box>
      <Footer />
    </Box>
  );
}
