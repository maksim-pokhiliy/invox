"use client";

import { Box, Paper, Typography, Chip, Divider, Collapse, alpha, useTheme } from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { formatDateTime } from "@app/lib/format";
import { EVENT_CONFIG } from "@app/lib/constants";

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
          "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.04) },
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
                {/* Timeline connector */}
                {!isLast && (
                  <Box
                    sx={{
                      position: "absolute",
                      left: 15,
                      top: 32,
                      bottom: 0,
                      width: 2,
                      bgcolor: "divider",
                    }}
                  />
                )}
                {/* Icon */}
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: config.color,
                    flexShrink: 0,
                    zIndex: 1,
                  }}
                >
                  {config.icon}
                </Box>
                {/* Content */}
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
