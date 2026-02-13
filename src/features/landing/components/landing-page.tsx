"use client";

import { Box } from "@mui/material";

import { LandingFeatures } from "./landing-features";
import { LandingFooter } from "./landing-footer";
import { LandingHeader } from "./landing-header";
import { LandingHero } from "./landing-hero";
import { LandingSelfHosted } from "./landing-self-hosted";

export function LandingPage() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", overflowX: "hidden" }}>
      <LandingHeader />
      <LandingHero />
      <LandingFeatures />
      <LandingSelfHosted />
      <LandingFooter />
    </Box>
  );
}
