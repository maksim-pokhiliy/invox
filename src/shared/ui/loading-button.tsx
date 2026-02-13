"use client";

import { Box, Button, type ButtonProps, CircularProgress } from "@mui/material";

import { UI } from "@app/shared/config/config";

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
          <CircularProgress size={UI.LOADER_SIZE_SM} thickness={4} color="inherit" />
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
        <CircularProgress
          size={UI.LOADER_SIZE_MD}
          thickness={4}
          color="inherit"
          sx={{ position: "absolute" }}
        />
      )}
    </Button>
  );
}
