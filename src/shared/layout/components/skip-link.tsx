"use client";

import { Link } from "@mui/material";

export function SkipLink() {
  return (
    <Link
      href="#main-content"
      sx={{
        position: "absolute",
        left: "-9999px",
        zIndex: 9999,
        padding: 2,
        bgcolor: "primary.main",
        color: "primary.contrastText",
        textDecoration: "none",
        fontWeight: 600,
        borderRadius: 1,
        "&:focus": {
          left: 16,
          top: 16,
        },
      }}
    >
      Skip to main content
    </Link>
  );
}
