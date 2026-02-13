"use client";

import { Box, Stack, Typography } from "@mui/material";

import { formatDate } from "@app/shared/lib/format";

interface InvoiceDatesProps {
  createdAt: string;
  dueDate: string;
  paidAt: string | null;
  isOverdue: boolean;
}

export function InvoiceDates({ createdAt, dueDate, paidAt, isOverdue }: InvoiceDatesProps) {
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
        <Typography
          variant="body1"
          fontWeight={500}
          color={isOverdue ? "error.main" : "text.primary"}
          sx={{ mt: 0.5 }}
        >
          {formatDate(dueDate)}
        </Typography>
      </Box>
      {paidAt && (
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            PAID DATE
          </Typography>
          <Typography variant="body1" fontWeight={500} color="success.main" sx={{ mt: 0.5 }}>
            {formatDate(paidAt)}
          </Typography>
        </Box>
      )}
    </Stack>
  );
}
