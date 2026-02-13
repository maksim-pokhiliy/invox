"use client";

import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { IconButton, Tooltip } from "@mui/material";

import { UI } from "@app/shared/config/config";

interface HelpTooltipProps {
  title: string;
}

export function HelpTooltip({ title }: HelpTooltipProps) {
  return (
    <Tooltip title={title} arrow>
      <IconButton size="small" sx={{ ml: 0.5, color: "text.secondary" }} aria-label={title}>
        <HelpOutlineIcon sx={{ fontSize: UI.ICON_SIZE_XS }} />
      </IconButton>
    </Tooltip>
  );
}
