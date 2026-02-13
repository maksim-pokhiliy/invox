"use client";

import { Checkbox, Stack, Typography } from "@mui/material";

import type { TimeEntryItem } from "../api";
import { formatAmount, formatHours } from "../lib/import-utils";

interface TimeEntryItemRowProps {
  item: TimeEntryItem;
  selected: boolean;
  onToggle: () => void;
}

export function TimeEntryItemRow({ item, selected, onToggle }: TimeEntryItemRowProps) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ py: 0.5, px: 1.5, pl: 5 }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Checkbox size="small" checked={selected} onChange={onToggle} />
        <Typography variant="body2">{item.title}</Typography>
      </Stack>
      <Stack direction="row" spacing={3} sx={{ minWidth: 180 }} justifyContent="flex-end">
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ minWidth: 50, textAlign: "right" }}
        >
          {formatHours(item.seconds)}
        </Typography>
        {item.rateCents !== null && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ minWidth: 80, textAlign: "right" }}
          >
            × ${(item.rateCents / 100).toFixed(2)}
          </Typography>
        )}
        <Typography variant="body2" fontWeight={500} sx={{ minWidth: 70, textAlign: "right" }}>
          {formatAmount(item.amountCents)}
        </Typography>
      </Stack>
    </Stack>
  );
}
