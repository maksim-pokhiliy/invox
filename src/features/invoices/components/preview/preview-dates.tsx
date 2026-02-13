"use client";

import { Box, Stack, Typography } from "@mui/material";

import { formatDate } from "@app/shared/lib/format";

interface PreviewDatesProps {
  createdAt: string;
  dueDate: string;
}

export function PreviewDates({ createdAt, dueDate }: PreviewDatesProps) {
  return (
    <Stack direction="row" spacing={4} sx={{ mb: 4 }}>
      <Box>
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          INVOICE DATE
        </Typography>
        <Typography variant="body1" fontWeight={500} sx={{ mt: 0.5 }}>
          {formatDate(createdAt)}
        </Typography>
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          DUE DATE
        </Typography>
        <Typography variant="body1" fontWeight={500} sx={{ mt: 0.5 }}>
          {formatDate(dueDate)}
        </Typography>
      </Box>
    </Stack>
  );
}
