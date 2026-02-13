"use client";

import SearchIcon from "@mui/icons-material/Search";
import { alpha, Button, Paper, Stack, Typography, useTheme } from "@mui/material";

import { UI } from "@app/shared/config/config";

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
      <Stack
        direction="row"
        sx={{
          width: UI.EMPTY_STATE_ICON_SIZE,
          height: UI.EMPTY_STATE_ICON_SIZE,
          borderRadius: "50%",
          bgcolor: alpha(theme.palette.action.active, UI.ALPHA_MEDIUM),
          alignItems: "center",
          justifyContent: "center",
          mx: "auto",
          mb: 3,
        }}
      >
        <SearchIcon sx={{ fontSize: UI.EMPTY_STATE_SEARCH_ICON_SIZE, color: "text.secondary" }} />
      </Stack>
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
