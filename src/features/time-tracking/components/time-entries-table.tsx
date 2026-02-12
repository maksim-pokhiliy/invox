"use client";

import * as React from "react";

import { alpha, Box, Checkbox, Stack, Typography, useTheme } from "@mui/material";

import { TIME_TRACKING } from "@app/shared/config/config";

import type { TimeEntriesResult, TimeEntryGroup, TimeEntryItem } from "../api";

function formatHours(seconds: number): string {
  const hours = seconds / TIME_TRACKING.SECONDS_PER_HOUR;

  return `${hours.toFixed(2)}h`;
}

function formatAmount(cents: number | null): string {
  if (cents === null) {
    return "";
  }

  return `$${(cents / 100).toFixed(2)}`;
}

export interface Selection {
  [groupId: string]: Set<string>;
}

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
        <GroupSection
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

interface GroupSectionProps {
  group: TimeEntryGroup;
  selectedItems: Set<string>;
  onToggleGroup: () => void;
  onToggleItem: (itemId: string) => void;
}

function GroupSection({ group, selectedItems, onToggleGroup, onToggleItem }: GroupSectionProps) {
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
        <ItemRow
          key={item.id}
          item={item}
          selected={selectedItems.has(item.id)}
          onToggle={() => onToggleItem(item.id)}
        />
      ))}
    </Box>
  );
}

interface ItemRowProps {
  item: TimeEntryItem;
  selected: boolean;
  onToggle: () => void;
}

function ItemRow({ item, selected, onToggle }: ItemRowProps) {
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
