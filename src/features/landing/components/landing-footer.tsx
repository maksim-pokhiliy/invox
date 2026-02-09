"use client";

import { Box, Link as MuiLink, Typography } from "@mui/material";
import { GITHUB_URL } from "../constants";

export function LandingFooter() {
  return (
    <Box
      component="footer"
      sx={{ py: 4, textAlign: "center", borderTop: 1, borderColor: "divider" }}
    >
      <Typography variant="body2" color="text.secondary">
        &copy; {new Date().getFullYear()} Invox &middot; MIT License &middot;{" "}
        <MuiLink
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ fontWeight: 600 }}
        >
          GitHub
        </MuiLink>
      </Typography>
    </Box>
  );
}
