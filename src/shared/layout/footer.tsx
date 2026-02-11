"use client";

import * as React from "react";

import { Box, Container, Link as MuiLink, Typography } from "@mui/material";

import { Logo } from "@app/shared/ui/logo";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        mt: "auto",
        py: 4,
        px: 3,
      }}
    >
      <Container maxWidth="lg" disableGutters>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Logo size="small" showText={false} />
            <Typography variant="body2" color="text.secondary">
              &copy; {currentYear}{" "}
              <a
                href="https://getpaid.dev"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "inherit" }}
              >
                GetPaid
              </a>
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 3 }}>
            <MuiLink href="/app/invoices" color="text.secondary" underline="hover" variant="body2">
              Invoices
            </MuiLink>
            <MuiLink href="/app/settings" color="text.secondary" underline="hover" variant="body2">
              Settings
            </MuiLink>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
