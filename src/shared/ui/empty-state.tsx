"use client";

import * as React from "react";
import { Box, Button, Fade, Grow, Paper, Typography, alpha, useTheme } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
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
            <Box
              sx={{
                width: UI.EMPTY_STATE_ICON_SIZE,
                height: UI.EMPTY_STATE_ICON_SIZE,
                borderRadius: "50%",
                bgcolor: alpha(theme.palette.primary.main, UI.ALPHA_MUTED),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
              }}
            >
              {icon}
            </Box>
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

interface NoResultsProps {
  entity: string;
  onClear: () => void;
}

export function NoResults({ entity, onClear }: NoResultsProps) {
  const theme = useTheme();

  return (
    <Paper
      sx={{
        p: 6,
        textAlign: "center",
        borderRadius: 3,
        bgcolor: alpha(theme.palette.primary.main, UI.ALPHA_LIGHT),
      }}
      elevation={0}
    >
      <Box
        sx={{
          width: UI.EMPTY_STATE_ICON_SIZE,
          height: UI.EMPTY_STATE_ICON_SIZE,
          borderRadius: "50%",
          bgcolor: alpha(theme.palette.action.active, UI.ALPHA_MEDIUM),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mx: "auto",
          mb: 3,
        }}
      >
        <SearchIcon sx={{ fontSize: UI.EMPTY_STATE_SEARCH_ICON_SIZE, color: "text.secondary" }} />
      </Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        No {entity} found
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: "auto" }}>
        Try adjusting your search or filters to find what you&apos;re looking for.
      </Typography>
      <Button variant="outlined" onClick={onClear}>
        Clear Filters
      </Button>
    </Paper>
  );
}
