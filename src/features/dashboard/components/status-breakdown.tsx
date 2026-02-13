"use client";

import PeopleIcon from "@mui/icons-material/People";
import { alpha, Box, Stack, Typography, useTheme } from "@mui/material";

import { UI } from "@app/shared/config/config";
import { getStatusColor, STATUS_CONFIG } from "@app/shared/config/invoice-status";
import { CardSkeleton } from "@app/shared/ui/skeletons";

interface StatusBreakdownProps {
  isLoading: boolean;
  statusCounts: Record<string, number> | undefined;
  clientCount: number;
}

export function StatusBreakdown({ isLoading, statusCounts, clientCount }: StatusBreakdownProps) {
  const theme = useTheme();

  if (isLoading) {
    return <CardSkeleton />;
  }

  const entries = Object.entries(statusCounts || {});

  if (entries.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          No invoice data yet
        </Typography>
      </Box>
    );
  }

  const total = entries.reduce((sum, [, count]) => sum + count, 0);

  return (
    <Box sx={{ mt: 2 }}>
      {entries.map(([status, count]) => {
        const color = getStatusColor(theme, status);
        const percentage = total > 0 ? (count / total) * 100 : 0;

        return (
          <Box key={status} sx={{ mb: 2.5, "&:last-child": { mb: 1.5 } }}>
            <Stack
              direction="row"
              sx={{
                alignItems: "center",
                justifyContent: "space-between",
                mb: 0.75,
              }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Box
                  sx={{
                    width: UI.STATUS_DOT_SIZE,
                    height: UI.STATUS_DOT_SIZE,
                    borderRadius: "50%",
                    bgcolor: color,
                  }}
                />
                <Typography variant="body2">{STATUS_CONFIG[status]?.label || status}</Typography>
              </Stack>
              <Typography variant="body2" fontWeight={600}>
                {count}
              </Typography>
            </Stack>
            <Box
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: alpha(color, 0.12),
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  height: "100%",
                  width: `${percentage}%`,
                  borderRadius: 3,
                  bgcolor: color,
                  transition: (t) =>
                    t.transitions.create("width", { duration: t.transitions.duration.complex }),
                }}
              />
            </Box>
          </Box>
        );
      })}
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          pt: 2,
          mt: 1,
          borderTop: 1,
          borderColor: "divider",
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <PeopleIcon fontSize="small" color="action" />
          <Typography variant="body2">Total Clients</Typography>
        </Stack>
        <Typography variant="body2" fontWeight={600}>
          {clientCount}
        </Typography>
      </Stack>
    </Box>
  );
}
