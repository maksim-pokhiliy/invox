"use client";

import { Box, CircularProgress, keyframes, Stack, Typography } from "@mui/material";

import { UI } from "@app/shared/config/config";

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

const bounce = keyframes`
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
`;

export function PageLoader({ message }: { message?: string }) {
  return (
    <Stack
      direction="column"
      spacing={2}
      sx={{
        alignItems: "center",
        justifyContent: "center",
        minHeight: "50vh",
      }}
    >
      <CircularProgress size={UI.LOADER_SIZE_LG} thickness={4} />
      {message && (
        <Typography color="text.secondary" variant="body2">
          {message}
        </Typography>
      )}
    </Stack>
  );
}

export function Spinner({ size = 24 }: { size?: number }) {
  return <CircularProgress size={size} thickness={4} />;
}

export function DotsLoader() {
  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            bgcolor: "primary.main",
            animation: `${bounce} 1.4s ease-in-out infinite`,
            animationDelay: `${i * 0.16}s`,
          }}
        />
      ))}
    </Stack>
  );
}

export function PulsingText({ width = 100 }: { width?: number | string }) {
  return (
    <Box
      sx={{
        width,
        height: 16,
        borderRadius: 1,
        bgcolor: "action.hover",
        animation: `${pulse} 2s ease-in-out infinite`,
      }}
    />
  );
}
