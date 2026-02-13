"use client";

import * as React from "react";

import { alpha, Box, Fade, Grow, Paper, Stack, Typography, useTheme } from "@mui/material";

import { ANIMATION, UI } from "@app/shared/config/config";

interface EmptyStateProps {
  icon: React.ReactNode;
  illustration?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, illustration, title, description, action }: EmptyStateProps) {
  const theme = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Paper
      sx={{
        p: illustration ? 6 : 8,
        textAlign: "center",
        borderRadius: 3,
        bgcolor: alpha(theme.palette.primary.main, UI.ALPHA_LIGHT),
        border: `1px dashed ${alpha(theme.palette.primary.main, UI.ALPHA_BORDER)}`,
      }}
      elevation={0}
    >
      <Grow in={mounted} timeout={ANIMATION.NORMAL}>
        <Box sx={{ mb: 3 }}>
          {illustration ? (
            <Box sx={{ mx: "auto", mb: 1, maxWidth: 200 }}>{illustration}</Box>
          ) : (
            <Stack
              direction="row"
              sx={{
                width: UI.EMPTY_STATE_ICON_SIZE,
                height: UI.EMPTY_STATE_ICON_SIZE,
                borderRadius: "50%",
                bgcolor: alpha(theme.palette.primary.main, UI.ALPHA_MUTED),
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
              }}
            >
              {React.isValidElement(icon)
                ? React.cloneElement(icon as React.ReactElement<{ sx?: object }>, {
                    sx: {
                      fontSize: UI.EMPTY_STATE_ICON_FONT_SIZE,
                      color: "primary.main",
                      ...(icon.props as { sx?: object }).sx,
                    },
                  })
                : icon}
            </Stack>
          )}
        </Box>
      </Grow>
      <Fade in={mounted} timeout={ANIMATION.SLOW} style={{ transitionDelay: "100ms" }}>
        <Box>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            {title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: action ? 3 : 0, maxWidth: 400, mx: "auto" }}
          >
            {description}
          </Typography>
          {action}
        </Box>
      </Fade>
    </Paper>
  );
}
