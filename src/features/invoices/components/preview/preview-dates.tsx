"use client";

import { Box, Stack, Typography } from "@mui/material";

import { formatDate } from "@app/shared/lib/format";

interface PreviewDatesProps {
  createdAt: string;
  dueDate: string;
  periodStart?: string | null;
  periodEnd?: string | null;
}

export function PreviewDates({ createdAt, dueDate, periodStart, periodEnd }: PreviewDatesProps) {
  return (
    <Stack direction="row" spacing={4} sx={{ mb: 4, flexWrap: "wrap" }}>
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
      {periodStart && periodEnd && (
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            BILLING PERIOD
          </Typography>
          <Typography variant="body1" fontWeight={500} sx={{ mt: 0.5 }}>
            {formatDate(periodStart)} — {formatDate(periodEnd)}
          </Typography>
        </Box>
      )}
    </Stack>
  );
}
