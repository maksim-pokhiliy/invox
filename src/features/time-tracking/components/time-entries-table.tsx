"use client";

import * as React from "react";

import { alpha, Box, Checkbox, Stack, Typography, useTheme } from "@mui/material";

import type { Selection, TimeEntriesResult, TimeEntryGroup } from "../api";
import { formatAmount, formatHours } from "../lib/import-utils";
import { TimeEntryGroupSection } from "./time-entry-group-section";

interface TimeEntriesTableProps {
  data: TimeEntriesResult;
  selection: Selection;
  onSelectionChange: (selection: Selection) => void;
}

export function TimeEntriesTable({ data, selection, onSelectionChange }: TimeEntriesTableProps) {
  const theme = useTheme();

  const allItemIds = React.useMemo(() => {
    const map: Selection = {};

    data.groups.forEach((group) => {
      map[group.id] = new Set(group.items.map((item) => item.id));
    });

    return map;
  }, [data]);

  const totalSelected = Object.values(selection).reduce((sum, set) => sum + set.size, 0);
  const totalItems = data.groups.reduce((sum, g) => sum + g.items.length, 0);
  const allSelected = totalSelected === totalItems && totalItems > 0;

  const selectedSeconds = data.groups.reduce((sum, group) => {
    const groupSel = selection[group.id];

    if (!groupSel) {
      return sum;
    }

    return (
      sum +
      group.items.filter((item) => groupSel.has(item.id)).reduce((s, item) => s + item.seconds, 0)
    );
  }, 0);

  const selectedAmount = data.groups.reduce((sum, group) => {
    const groupSel = selection[group.id];

    if (!groupSel) {
      return sum;
    }

    return (
      sum +
      group.items
        .filter((item) => groupSel.has(item.id))
        .reduce((s, item) => s + (item.amountCents ?? 0), 0)
    );
  }, 0);

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange({});
    } else {
      onSelectionChange(
        Object.fromEntries(Object.entries(allItemIds).map(([gId, items]) => [gId, new Set(items)]))
      );
    }
  };

  const handleToggleGroup = (group: TimeEntryGroup) => {
    const next = { ...selection };
    const current = next[group.id] ?? new Set<string>();
    const allGroupItems = group.items.map((i) => i.id);
    const allGroupSelected = allGroupItems.every((id) => current.has(id));

    if (allGroupSelected) {
      delete next[group.id];
    } else {
      next[group.id] = new Set(allGroupItems);
    }

    onSelectionChange(next);
  };

  const handleToggleItem = (groupId: string, itemId: string) => {
    const next = { ...selection };
    const current = new Set(next[groupId] ?? []);

    if (current.has(itemId)) {
      current.delete(itemId);
    } else {
      current.add(itemId);
    }

    if (current.size === 0) {
      delete next[groupId];
    } else {
      next[groupId] = current;
    }

    onSelectionChange(next);
  };

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          py: 1,
          px: 1.5,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.04),
          mb: 1,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Checkbox
            size="small"
            checked={allSelected}
            indeterminate={totalSelected > 0 && !allSelected}
            onChange={handleSelectAll}
          />
          <Typography variant="body2" fontWeight={600}>
            {allSelected ? "Deselect all" : "Select all"}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={3}>
          <Typography variant="body2" fontWeight={600}>
            {formatHours(selectedSeconds)}
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {formatAmount(selectedAmount || null)}
          </Typography>
        </Stack>
      </Stack>

      {data.groups.map((group) => (
        <TimeEntryGroupSection
          key={group.id}
          group={group}
          selectedItems={selection[group.id] ?? new Set()}
          onToggleGroup={() => handleToggleGroup(group)}
          onToggleItem={(itemId) => handleToggleItem(group.id, itemId)}
        />
      ))}
    </Box>
  );
}
