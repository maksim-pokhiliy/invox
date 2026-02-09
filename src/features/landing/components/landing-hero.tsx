"use client";

import Link from "next/link";
import { Button, Chip, Container, Stack, Typography } from "@mui/material";
import CodeIcon from "@mui/icons-material/Code";
import GitHubIcon from "@mui/icons-material/GitHub";
import { GITHUB_URL } from "../constants";

export function LandingHero() {
  return (
    <Container
      maxWidth="md"
      sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 8, md: 10 }, textAlign: "center" }}
    >
      <Chip
        label="Open Source"
        icon={<CodeIcon />}
        variant="outlined"
        color="primary"
        size="small"
        sx={{ mb: 3 }}
      />

      <Typography
        variant="h2"
        component="h1"
        fontWeight={800}
        sx={{
          fontSize: { xs: "2.25rem", md: "3.5rem" },
          lineHeight: 1.15,
          letterSpacing: "-0.025em",
          mb: 2.5,
        }}
      >
        Invoicing that gets
        <br />
        out of your way
      </Typography>

      <Typography
        variant="h6"
        color="text.secondary"
        fontWeight={400}
        sx={{ maxWidth: 560, mx: "auto", mb: 5, lineHeight: 1.6 }}
      >
        Simple, self-hosted invoice management for freelancers. No bloat, no hidden fees, no vendor
        lock-in.
      </Typography>

      <Stack direction="row" spacing={2} justifyContent="center">
        <Button
          component={Link}
          href="/auth/sign-up"
          variant="contained"
          size="large"
          sx={{ px: 4, py: 1.5 }}
        >
          Try for Free
        </Button>
        <Button
          component="a"
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          variant="outlined"
          size="large"
          startIcon={<GitHubIcon />}
          sx={{ px: 4, py: 1.5 }}
        >
          View Source
        </Button>
      </Stack>
    </Container>
  );
}
