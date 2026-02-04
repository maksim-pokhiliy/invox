"use client";

import * as React from "react";
import { Fade, Box } from "@mui/material";

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Fade in={mounted} timeout={300}>
      <Box>{children}</Box>
    </Fade>
  );
}
