"use client";

import { alpha, Box, Checkbox, Stack, Typography, useTheme } from "@mui/material";

import type { TimeEntryGroup } from "../api";
import { formatAmount, formatHours } from "../lib/import-utils";
import { TimeEntryItemRow } from "./time-entry-item-row";

interface TimeEntryGroupSectionProps {
  group: TimeEntryGroup;
  selectedItems: Set<string>;
  onToggleGroup: () => void;
  onToggleItem: (itemId: string) => void;
}

export function TimeEntryGroupSection({
  group,
  selectedItems,
  onToggleGroup,
  onToggleItem,
}: TimeEntryGroupSectionProps) {
  const theme = useTheme();
  const allSelected = group.items.every((i) => selectedItems.has(i.id));
  const someSelected = group.items.some((i) => selectedItems.has(i.id));

  return (
    <Box sx={{ mb: 1 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          py: 0.5,
          px: 1.5,
          borderRadius: 1,
          bgcolor: alpha(theme.palette.text.primary, 0.03),
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Checkbox
            size="small"
            checked={allSelected}
            indeterminate={someSelected && !allSelected}
            onChange={onToggleGroup}
          />
          <Typography variant="subtitle2" fontWeight={600}>
            {group.title}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={3}>
          <Typography variant="body2" color="text.secondary">
            {formatHours(group.totalSeconds)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatAmount(group.totalAmountCents)}
          </Typography>
        </Stack>
      </Stack>

      {group.items.map((item) => (
        <TimeEntryItemRow
          key={item.id}
          item={item}
          selected={selectedItems.has(item.id)}
          onToggle={() => onToggleItem(item.id)}
        />
      ))}
    </Box>
  );
}
