"use client";

import { Box, Paper, Typography, Grid, alpha, useTheme } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SendIcon from "@mui/icons-material/Send";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PaymentIcon from "@mui/icons-material/Payment";
import { formatDate, formatDateTime } from "@app/lib/format";

interface InvoiceTimelineProps {
  dueDate: string;
  sentAt: string | null;
  viewedAt: string | null;
  paidAt: string | null;
  paymentMethod: string | null;
  isOverdue: boolean;
}

export function InvoiceTimeline({
  dueDate,
  sentAt,
  viewedAt,
  paidAt,
  paymentMethod,
  isOverdue,
}: InvoiceTimelineProps) {
  const theme = useTheme();

  return (
    <Paper
      sx={{
        p: 3,
        mb: 3,
        borderRadius: 3,
        bgcolor: alpha(theme.palette.primary.main, 0.02),
      }}
    >
      <Grid container spacing={3}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <AccessTimeIcon sx={{ fontSize: 18, color: "text.secondary" }} />
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              DUE DATE
            </Typography>
          </Box>
          <Typography
            variant="body1"
            fontWeight={600}
            color={isOverdue ? "error.main" : "text.primary"}
          >
            {formatDate(dueDate)}
          </Typography>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <SendIcon sx={{ fontSize: 18, color: sentAt ? "success.main" : "text.disabled" }} />
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              SENT
            </Typography>
          </Box>
          <Typography
            variant="body1"
            fontWeight={500}
            color={sentAt ? "text.primary" : "text.disabled"}
          >
            {sentAt ? formatDateTime(sentAt) : "Not sent"}
          </Typography>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <VisibilityIcon
              sx={{ fontSize: 18, color: viewedAt ? "info.main" : "text.disabled" }}
            />
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              VIEWED
            </Typography>
          </Box>
          <Typography
            variant="body1"
            fontWeight={500}
            color={viewedAt ? "text.primary" : "text.disabled"}
          >
            {viewedAt ? formatDateTime(viewedAt) : "Not viewed"}
          </Typography>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <PaymentIcon sx={{ fontSize: 18, color: paidAt ? "success.main" : "text.disabled" }} />
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              PAID
            </Typography>
          </Box>
          <Typography
            variant="body1"
            fontWeight={500}
            color={paidAt ? "success.main" : "text.disabled"}
          >
            {paidAt ? formatDateTime(paidAt) : "Unpaid"}
          </Typography>
          {paymentMethod && (
            <Typography variant="caption" color="text.secondary">
              via {paymentMethod}
            </Typography>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
}
