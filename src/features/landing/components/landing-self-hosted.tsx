"use client";

import { Chip, Container, Paper, Stack, Typography, alpha, useTheme } from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { TECH_STACK } from "../constants";

export function LandingSelfHosted() {
  const theme = useTheme();

  return (
    <Container maxWidth="md" sx={{ py: { xs: 8, md: 10 }, textAlign: "center" }}>
      <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" sx={{ mb: 2 }}>
        <DarkModeIcon sx={{ color: "text.secondary" }} />
        <Typography variant="body2" color="text.secondary">
          Light &amp; dark themes included
        </Typography>
      </Stack>

      <Typography variant="h4" fontWeight={700} sx={{ mb: 1.5, letterSpacing: "-0.015em" }}>
        Self-host in one command
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 480, mx: "auto" }}>
        Your data stays on your server. Deploy with Docker in seconds.
      </Typography>

      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.text.primary, 0.04),
          fontFamily: "monospace",
          fontSize: "0.95rem",
          mb: 5,
          maxWidth: 550,
          mx: "auto",
          textAlign: "left",
        }}
      >
        <Typography component="code" sx={{ fontFamily: "inherit", fontSize: "inherit" }}>
          $ git clone https://github.com/maksim-pokhiliy/invox.git
          <br />
          $ cd invox
          <br />$ docker compose up
        </Typography>
      </Paper>

      <Typography variant="overline" color="text.secondary" sx={{ mb: 2, display: "block" }}>
        Built with
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center" useFlexGap>
        {TECH_STACK.map((tech) => (
          <Chip key={tech} label={tech} size="small" variant="outlined" sx={{ fontWeight: 500 }} />
        ))}
      </Stack>
    </Container>
  );
}
