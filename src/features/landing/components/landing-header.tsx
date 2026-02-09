"use client";

import Link from "next/link";
import { Box, Button, Stack } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import { Logo } from "@app/shared/ui/logo";
import { GITHUB_URL } from "../constants";

export function LandingHeader() {
  return (
    <Box
      component="header"
      sx={{
        py: 2,
        px: 3,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        maxWidth: 1200,
        mx: "auto",
      }}
    >
      <Logo size="medium" />
      <Stack direction="row" spacing={1}>
        <Button
          component="a"
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          startIcon={<GitHubIcon />}
          color="inherit"
          size="small"
        >
          GitHub
        </Button>
        <Button component={Link} href="/auth/sign-in" variant="outlined" size="small">
          Sign In
        </Button>
        <Button component={Link} href="/auth/sign-up" variant="contained" size="small">
          Get Started
        </Button>
      </Stack>
    </Box>
  );
}
