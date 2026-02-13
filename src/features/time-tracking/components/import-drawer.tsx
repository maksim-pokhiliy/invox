"use client";

import * as React from "react";

import CloseIcon from "@mui/icons-material/Close";
import { Alert, Box, Button, Drawer, IconButton, Stack, Typography } from "@mui/material";

import { TIME_TRACKING } from "@app/shared/config/config";

import type {
  ImportedGroup,
  ImportedItem,
  Project,
  ProviderInfo,
  Selection,
  TimeEntriesResult,
} from "../api";
import { RATE_SOURCE, type RateSource } from "../constants";
import { useSearchTimeEntries } from "../hooks";
import { buildDateRange, resolveItemRate } from "../lib/import-utils";
import { ImportDrawerFilters } from "./import-drawer-filters";
import { TimeEntriesTable } from "./time-entries-table";

interface ImportDrawerProps {
  open: boolean;
  onClose: () => void;
  providerId: string;
  provider: ProviderInfo;
  getpaidRateCents: number;
  onImport: (groups: ImportedGroup[]) => void;
}

export function ImportDrawer({
  open,
  onClose,
  providerId,
  provider,
  getpaidRateCents,
  onImport,
}: ImportDrawerProps) {
  const [workspaceId, setWorkspaceId] = React.useState("");
  const [selectedProjects, setSelectedProjects] = React.useState<Project[]>([]);
  const [startDate, setStartDate] = React.useState(buildDateRange().startDate);
  const [endDate, setEndDate] = React.useState(buildDateRange().endDate);
  const [grouping, setGrouping] = React.useState("projects");
  const [subGrouping, setSubGrouping] = React.useState(
    provider.capabilities.allowedCombinations["projects"]?.[0] ?? "tasks"
  );
  const [roundingMinutes, setRoundingMinutes] = React.useState(0);
  const [rateSource, setRateSource] = React.useState<RateSource>(
    provider.capabilities.hasBillableRates ? RATE_SOURCE.PROVIDER : RATE_SOURCE.GETPAID
  );
  const [customRateCents, setCustomRateCents] = React.useState(0);
  const [selection, setSelection] = React.useState<Selection>({});
  const [result, setResult] = React.useState<TimeEntriesResult | null>(null);

  const searchMutation = useSearchTimeEntries();

  const handleSearch = () => {
    if (!workspaceId) {
      return;
    }

    searchMutation.mutate(
      {
        provider: providerId,
        workspaceId,
        startDate,
        endDate,
        projectIds: selectedProjects.length > 0 ? selectedProjects.map((p) => p.id) : undefined,
        grouping: grouping === "none" ? "projects" : grouping,
        subGrouping,
        roundingMinutes: roundingMinutes > 0 ? roundingMinutes : undefined,
      },
      {
        onSuccess: (data) => {
          setResult(data);
          const allSelection: Selection = {};

          data.groups.forEach((g) => {
            allSelection[g.id] = new Set(g.items.map((i) => i.id));
          });
          setSelection(allSelection);
        },
      }
    );
  };

  const handleImport = () => {
    if (!result) {
      return;
    }

    const groups: ImportedGroup[] = [];

    for (const group of result.groups) {
      const selectedItems = selection[group.id];

      if (!selectedItems?.size) {
        continue;
      }

      const items: ImportedItem[] = group.items
        .filter((item) => selectedItems.has(item.id))
        .map((item) => {
          const rateCents = resolveItemRate(
            rateSource,
            item.rateCents,
            getpaidRateCents,
            customRateCents
          );
          const hours = item.seconds / TIME_TRACKING.SECONDS_PER_HOUR;
          const roundedHours = Math.round(hours * 100) / 100;

          return {
            title: item.title,
            description: "",
            quantity: roundedHours,
            unitPrice: rateCents / 100,
          };
        });

      if (items.length > 0) {
        groups.push({ title: group.title, items });
      }
    }

    onImport(groups);
    onClose();
  };

  const handleWorkspaceChange = (id: string) => {
    setWorkspaceId(id);
    setResult(null);
  };

  const totalSelected = Object.values(selection).reduce((sum, set) => sum + set.size, 0);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { maxWidth: TIME_TRACKING.IMPORT_DRAWER_WIDTH } } }}
    >
      <Stack direction="column" sx={{ height: "100%" }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 3, py: 2, borderBottom: 1, borderColor: "divider" }}
        >
          <Typography variant="h6" fontWeight={600}>
            Import Time
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>

        <Box sx={{ flex: 1, overflow: "auto", px: 3, py: 2 }}>
          <Stack spacing={3}>
            <ImportDrawerFilters
              open={open}
              providerId={providerId}
              provider={provider}
              workspaceId={workspaceId}
              onWorkspaceChange={handleWorkspaceChange}
              selectedProjects={selectedProjects}
              onProjectsChange={setSelectedProjects}
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              grouping={grouping}
              subGrouping={subGrouping}
              roundingMinutes={roundingMinutes}
              rateSource={rateSource}
              customRateCents={customRateCents}
              onGroupingChange={setGrouping}
              onSubGroupingChange={setSubGrouping}
              onRoundingChange={setRoundingMinutes}
              onRateSourceChange={setRateSource}
              onCustomRateChange={setCustomRateCents}
              isSearching={searchMutation.isPending}
              onSearch={handleSearch}
            />

            {searchMutation.isError && (
              <Alert severity="error">
                {searchMutation.error?.message ?? "Failed to load time entries"}
              </Alert>
            )}

            {result && (
              <>
                {result.groups.length === 0 ? (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textAlign: "center", py: 4 }}
                  >
                    No time entries found for the selected period
                  </Typography>
                ) : (
                  <TimeEntriesTable
                    data={result}
                    selection={selection}
                    onSelectionChange={setSelection}
                  />
                )}
              </>
            )}
          </Stack>
        </Box>

        {result && result.groups.length > 0 && (
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="flex-end"
            spacing={2}
            sx={{ px: 3, py: 2, borderTop: 1, borderColor: "divider" }}
          >
            <Button onClick={onClose}>Cancel</Button>
            <Button variant="contained" onClick={handleImport} disabled={totalSelected === 0}>
              Add to invoice ({totalSelected})
            </Button>
          </Stack>
        )}
      </Stack>
    </Drawer>
  );
}
