"use client";

import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HistoryIcon from "@mui/icons-material/History";
import {
  alpha,
  Box,
  Chip,
  Collapse,
  Divider,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";

import { UI } from "@app/shared/config/config";
import { formatDateTime } from "@app/shared/lib/format";
import type { InvoiceEvent } from "@app/shared/schemas/api";

import { EVENT_CONFIG } from "../constants/invoice";

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
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          p: 2,
          cursor: "pointer",
          "&:hover": { bgcolor: alpha(theme.palette.primary.main, UI.ALPHA_HOVER) },
        }}
        onClick={onToggle}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <HistoryIcon color="action" />
          <Typography variant="subtitle1" fontWeight={600}>
            Activity History
          </Typography>
          <Chip label={events.length} size="small" />
        </Stack>
        {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </Stack>
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
              <Stack
                key={event.id}
                direction="row"
                spacing={2}
                sx={{
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
                <Stack
                  direction="row"
                  sx={{
                    width: UI.TIMELINE_DOT_SIZE,
                    height: UI.TIMELINE_DOT_SIZE,
                    borderRadius: "50%",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: alpha(theme.palette.primary.main, UI.ALPHA_MUTED),
                    color: config.color,
                    flexShrink: 0,
                    zIndex: 1,
                  }}
                >
                  {config.icon}
                </Stack>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={500}>
                    {config.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDateTime(event.createdAt)}
                  </Typography>
                </Box>
              </Stack>
            );
          })}
        </Box>
      </Collapse>
    </Paper>
  );
}
