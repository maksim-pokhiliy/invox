"use client";

import { Box, Button, Paper, Typography, alpha, useTheme } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  dashed?: boolean;
}

export function EmptyState({ icon, title, description, action, dashed = false }: EmptyStateProps) {
  const theme = useTheme();

  return (
    <Paper
      sx={{
        p: 8,
        textAlign: "center",
        borderRadius: 3,
        bgcolor: alpha(theme.palette.primary.main, 0.02),
        ...(dashed && {
          border: `2px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
        }),
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mx: "auto",
          mb: 3,
        }}
      >
        {icon}
      </Box>
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
        bgcolor: alpha(theme.palette.primary.main, 0.02),
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          bgcolor: alpha(theme.palette.action.active, 0.08),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mx: "auto",
          mb: 3,
        }}
      >
        <SearchIcon sx={{ fontSize: 40, color: "text.secondary" }} />
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
