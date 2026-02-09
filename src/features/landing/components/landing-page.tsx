"use client";

import { Box } from "@mui/material";
import { LandingHeader } from "./landing-header";
import { LandingHero } from "./landing-hero";
import { LandingFeatures } from "./landing-features";
import { LandingSelfHosted } from "./landing-self-hosted";
import { LandingFooter } from "./landing-footer";

export function LandingPage() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <LandingHeader />
      <LandingHero />
      <LandingFeatures />
      <LandingSelfHosted />
      <LandingFooter />
    </Box>
  );
}
