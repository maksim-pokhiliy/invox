"use client";

import { Box, Paper, Typography, Chip, Divider, Collapse, alpha, useTheme } from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { formatDateTime } from "@app/shared/lib/format";
import { UI } from "@app/shared/config/config";
import { EVENT_CONFIG } from "@app/features/invoices/constants/invoice";

interface InvoiceEvent {
  id: string;
  type: string;
  createdAt: string;
}

interface ActivityHistoryProps {
  events: InvoiceEvent[];
  expanded: boolean;
  onToggle: () => void;
}

export function ActivityHistory({ events, expanded, onToggle }: ActivityHistoryProps) {
  const theme = useTheme();

  if (!events || events.length === 0) {
    return null;
  }

  return (
    <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 2,
          cursor: "pointer",
          "&:hover": { bgcolor: alpha(theme.palette.primary.main, UI.ALPHA_HOVER) },
        }}
        onClick={onToggle}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <HistoryIcon color="action" />
          <Typography variant="subtitle1" fontWeight={600}>
            Activity History
          </Typography>
          <Chip label={events.length} size="small" />
        </Box>
        {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </Box>
      <Collapse in={expanded}>
        <Divider />
        <Box sx={{ p: 2 }}>
          {events.map((event, index) => {
            const config = EVENT_CONFIG[event.type] || {
              icon: <HistoryIcon fontSize="small" />,
              label: event.type,
              color: "text.secondary",
            };
            const isLast = index === events.length - 1;

            return (
              <Box
                key={event.id}
                sx={{
                  display: "flex",
                  gap: 2,
                  pb: isLast ? 0 : 2,
                  position: "relative",
                }}
              >
                {!isLast && (
                  <Box
                    sx={{
                      position: "absolute",
                      left: UI.TIMELINE_LINE_LEFT,
                      top: UI.TIMELINE_LINE_TOP,
                      bottom: 0,
                      width: UI.TIMELINE_LINE_WIDTH,
                      bgcolor: "divider",
                    }}
                  />
                )}
                <Box
                  sx={{
                    width: UI.TIMELINE_DOT_SIZE,
                    height: UI.TIMELINE_DOT_SIZE,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: alpha(theme.palette.primary.main, UI.ALPHA_MUTED),
                    color: config.color,
                    flexShrink: 0,
                    zIndex: 1,
                  }}
                >
                  {config.icon}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={500}>
                    {config.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDateTime(event.createdAt)}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Collapse>
    </Paper>
  );
}
