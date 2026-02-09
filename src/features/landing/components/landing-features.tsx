"use client";

import { Box, Container, Paper, Typography, alpha, useTheme } from "@mui/material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RepeatIcon from "@mui/icons-material/Repeat";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { FEATURES } from "../constants";
import { UI } from "@app/shared/config/config";

const FEATURE_ICONS: Record<string, React.ReactElement> = {
  Invoices: <ReceiptLongIcon />,
  "View Tracking": <VisibilityIcon />,
  Recurring: <RepeatIcon />,
  "Follow-ups": <NotificationsActiveIcon />,
  "PDF Export": <PictureAsPdfIcon />,
  Dashboard: <DashboardIcon />,
};

export function LandingFeatures() {
  const theme = useTheme();

  return (
    <Box sx={{ bgcolor: alpha(theme.palette.primary.main, UI.ALPHA_LIGHT), py: { xs: 8, md: 10 } }}>
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          fontWeight={700}
          textAlign="center"
          sx={{ mb: 1.5, letterSpacing: "-0.015em" }}
        >
          Everything you need, nothing you don&apos;t
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          textAlign="center"
          sx={{ mb: 6, maxWidth: 500, mx: "auto" }}
        >
          Built for freelancers who want to send invoices and get paid — not learn accounting
          software.
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
            gap: 3,
          }}
        >
          {FEATURES.map((feature) => (
            <Paper
              key={feature.title}
              elevation={0}
              sx={{
                p: 3.5,
                borderRadius: 3,
                border: 1,
                borderColor: "divider",
                transition: (t) => t.transitions.create("border-color"),
                "&:hover": { borderColor: "primary.main" },
              }}
            >
              <Box
                sx={{
                  width: UI.METRIC_ICON_SIZE,
                  height: UI.METRIC_ICON_SIZE,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, UI.ALPHA_MEDIUM),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "primary.main",
                  mb: 2,
                }}
              >
                {FEATURE_ICONS[feature.title]}
              </Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.75 }}>
                {feature.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" lineHeight={1.6}>
                {feature.description}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
