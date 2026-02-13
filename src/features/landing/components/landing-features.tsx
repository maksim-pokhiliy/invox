"use client";

import { alpha, Box, Container, Grid, Paper, Stack, Typography, useTheme } from "@mui/material";

import { UI } from "@app/shared/config/config";

import { FEATURES } from "../constants";

export function LandingFeatures() {
  const theme = useTheme();

  return (
    <Box sx={{ bgcolor: alpha(theme.palette.primary.main, UI.ALPHA_LIGHT), py: { xs: 8, md: 10 } }}>
      <Container maxWidth="lg">
        <Typography variant="h4" fontWeight={700} textAlign="center" sx={{ mb: 1.5 }}>
          Everything you need, nothing you don&apos;t
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          textAlign="center"
          sx={{ mb: 6, maxWidth: 500, mx: "auto" }}
        >
          Built for freelancers who want to send invoices and get paid — not learn accounting
          software.
        </Typography>

        <Grid container spacing={3}>
          {FEATURES.map((feature) => (
            <Grid key={feature.title} size={{ xs: 12, sm: 6, md: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3.5,
                  borderRadius: 3,
                  border: 1,
                  borderColor: "divider",
                  transition: (t) => t.transitions.create("border-color"),
                  "&:hover": { borderColor: "primary.main" },
                  height: "100%",
                }}
              >
                <Stack
                  sx={{
                    width: UI.METRIC_ICON_SIZE,
                    height: UI.METRIC_ICON_SIZE,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, UI.ALPHA_MEDIUM),
                    alignItems: "center",
                    justifyContent: "center",
                    color: "primary.main",
                    mb: 2,
                  }}
                >
                  <feature.icon />
                </Stack>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.75 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" lineHeight={1.6}>
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
