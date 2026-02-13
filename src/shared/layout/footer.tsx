"use client";

import { Box, Container, Link as MuiLink, Stack, Typography } from "@mui/material";

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
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
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
          </Stack>

          <Stack direction="row" spacing={3}>
            <MuiLink href="/app/invoices" color="text.secondary" underline="hover" variant="body2">
              Invoices
            </MuiLink>
            <MuiLink href="/app/settings" color="text.secondary" underline="hover" variant="body2">
              Settings
            </MuiLink>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
