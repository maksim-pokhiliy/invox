"use client";

import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PaymentIcon from "@mui/icons-material/Payment";
import SendIcon from "@mui/icons-material/Send";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { alpha, Grid, Paper, Stack, Typography, useTheme } from "@mui/material";

import { UI } from "@app/shared/config/config";
import { formatDate, formatDateTime } from "@app/shared/lib/format";

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
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.5 }}>
            <AccessTimeIcon sx={{ fontSize: UI.ICON_SIZE_SM, color: "text.secondary" }} />
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              DUE DATE
            </Typography>
          </Stack>
          <Typography
            variant="body1"
            fontWeight={600}
            color={isOverdue ? "error.main" : "text.primary"}
          >
            {formatDate(dueDate)}
          </Typography>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.5 }}>
            <SendIcon
              sx={{ fontSize: UI.ICON_SIZE_SM, color: sentAt ? "success.main" : "text.disabled" }}
            />
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              SENT
            </Typography>
          </Stack>
          <Typography
            variant="body1"
            fontWeight={500}
            color={sentAt ? "text.primary" : "text.disabled"}
          >
            {sentAt ? formatDateTime(sentAt) : "Not sent"}
          </Typography>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.5 }}>
            <VisibilityIcon
              sx={{ fontSize: UI.ICON_SIZE_SM, color: viewedAt ? "info.main" : "text.disabled" }}
            />
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              VIEWED
            </Typography>
          </Stack>
          <Typography
            variant="body1"
            fontWeight={500}
            color={viewedAt ? "text.primary" : "text.disabled"}
          >
            {viewedAt ? formatDateTime(viewedAt) : "Not viewed"}
          </Typography>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.5 }}>
            <PaymentIcon
              sx={{ fontSize: UI.ICON_SIZE_SM, color: paidAt ? "success.main" : "text.disabled" }}
            />
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              PAID
            </Typography>
          </Stack>
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
