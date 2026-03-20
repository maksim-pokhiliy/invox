"use client";

import { Chip } from "@mui/material";

const STATUS_MAP = {
  PENDING: { color: "warning" as const, label: "Pending" },
  APPROVED: { color: "success" as const, label: "Approved" },
};

interface WaitlistStatusChipProps {
  status: "PENDING" | "APPROVED";
}

export function WaitlistStatusChip({ status }: WaitlistStatusChipProps) {
  const config = STATUS_MAP[status];

  return <Chip label={config.label} size="small" color={config.color} sx={{ fontWeight: 500 }} />;
}
