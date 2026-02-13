"use client";

import Link from "next/link";

import GitHubIcon from "@mui/icons-material/GitHub";
import { Button, Stack } from "@mui/material";

import { Logo } from "@app/shared/ui/logo";

import { GITHUB_URL } from "../constants";

export function LandingHeader() {
  return (
    <Stack
      component="header"
      direction="row"
      sx={{
        py: 2,
        px: { xs: 2, sm: 3 },
        alignItems: "center",
        justifyContent: "space-between",
        maxWidth: 1200,
        mx: "auto",
        width: "100%",
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
          sx={{ display: { xs: "none", sm: "inline-flex" }, whiteSpace: "nowrap" }}
        >
          GitHub
        </Button>
        <Button
          component={Link}
          href="/auth/sign-in"
          variant="outlined"
          size="small"
          sx={{ whiteSpace: "nowrap" }}
        >
          Sign In
        </Button>
        <Button
          component={Link}
          href="/auth/sign-up"
          variant="contained"
          size="small"
          sx={{ whiteSpace: "nowrap" }}
        >
          Get Started
        </Button>
      </Stack>
    </Stack>
  );
}
