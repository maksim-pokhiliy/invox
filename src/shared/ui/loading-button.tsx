"use client";

import { Button, CircularProgress, Box, type ButtonProps } from "@mui/material";

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
}

export function LoadingButton({
  loading = false,
  disabled,
  children,
  startIcon,
  ...props
}: LoadingButtonProps) {
  const hasStartIcon = startIcon !== undefined;

  return (
    <Button
      disabled={disabled || loading}
      startIcon={
        loading && hasStartIcon ? (
          <CircularProgress size={16} thickness={4} color="inherit" />
        ) : (
          startIcon
        )
      }
      {...props}
    >
      <Box component="span" sx={{ visibility: loading && !hasStartIcon ? "hidden" : "visible" }}>
        {children}
      </Box>
      {loading && !hasStartIcon && (
        <CircularProgress size={20} thickness={4} color="inherit" sx={{ position: "absolute" }} />
      )}
    </Button>
  );
}
