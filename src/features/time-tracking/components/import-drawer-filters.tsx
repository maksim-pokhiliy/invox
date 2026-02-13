"use client";

import * as React from "react";

import {
  Autocomplete,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import dayjs, { type Dayjs } from "dayjs";

import type { Project, ProviderInfo } from "../api";
import type { RateSource } from "../constants";
import { useProjects, useWorkspaces } from "../hooks";
import { ImportSettings } from "./import-settings";

const SELECT_ALL_ID = "__select_all__";

interface ImportDrawerFiltersProps {
  open: boolean;
  providerId: string;
  provider: ProviderInfo;
  workspaceId: string;
  onWorkspaceChange: (id: string) => void;
  selectedProjects: Project[];
  onProjectsChange: (projects: Project[]) => void;
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  grouping: string;
  subGrouping: string;
  roundingMinutes: number;
  rateSource: RateSource;
  customRateCents: number;
  onGroupingChange: (v: string) => void;
  onSubGroupingChange: (v: string) => void;
  onRoundingChange: (v: number) => void;
  onRateSourceChange: (v: RateSource) => void;
  onCustomRateChange: (v: number) => void;
  isSearching: boolean;
  onSearch: () => void;
}

export function ImportDrawerFilters({
  open,
  providerId,
  provider,
  workspaceId,
  onWorkspaceChange,
  selectedProjects,
  onProjectsChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  grouping,
  subGrouping,
  roundingMinutes,
  rateSource,
  customRateCents,
  onGroupingChange,
  onSubGroupingChange,
  onRoundingChange,
  onRateSourceChange,
  onCustomRateChange,
  isSearching,
  onSearch,
}: ImportDrawerFiltersProps) {
  const { data: workspaces, isLoading: workspacesLoading } = useWorkspaces(
    open ? providerId : null
  );

  const { data: projects, isLoading: projectsLoading } = useProjects(
    open ? providerId : null,
    workspaceId || null
  );

  React.useEffect(() => {
    if (workspaces?.length && !workspaceId) {
      onWorkspaceChange(workspaces[0].id);
    }
  }, [workspaces, workspaceId, onWorkspaceChange]);

  return (
    <>
      <FormControl size="small" fullWidth>
        <InputLabel>Workspace</InputLabel>
        <Select
          value={workspaceId}
          label="Workspace"
          onChange={(e) => {
            onWorkspaceChange(e.target.value);
            onProjectsChange([]);
          }}
          disabled={workspacesLoading}
          endAdornment={
            workspacesLoading ? (
              <InputAdornment position="end" sx={{ mr: 2 }}>
                <CircularProgress size={18} />
              </InputAdornment>
            ) : undefined
          }
        >
          {workspaces?.map((ws) => (
            <MenuItem key={ws.id} value={ws.id}>
              {ws.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Stack direction="row" spacing={2}>
        <DatePicker
          label="Start date"
          value={startDate ? dayjs(startDate) : null}
          onChange={(date: Dayjs | null) => onStartDateChange(date?.format("YYYY-MM-DD") ?? "")}
          slotProps={{ textField: { size: "small", fullWidth: true } }}
        />
        <DatePicker
          label="End date"
          value={endDate ? dayjs(endDate) : null}
          onChange={(date: Dayjs | null) => onEndDateChange(date?.format("YYYY-MM-DD") ?? "")}
          slotProps={{ textField: { size: "small", fullWidth: true } }}
        />
      </Stack>

      <Autocomplete
        multiple
        size="small"
        options={projects ?? []}
        getOptionLabel={(option) => option.name}
        value={selectedProjects}
        onChange={(_, value, reason, details) => {
          const allProjects = projects ?? [];
          const isSelectAll = details?.option?.id === SELECT_ALL_ID;

          if (isSelectAll) {
            onProjectsChange(selectedProjects.length === allProjects.length ? [] : allProjects);
          } else if (reason === "removeOption" || reason === "selectOption") {
            onProjectsChange(value.filter((o) => o.id !== SELECT_ALL_ID));
          } else {
            onProjectsChange(value);
          }
        }}
        loading={projectsLoading}
        disableCloseOnSelect
        filterOptions={(options) => {
          if (options.length === 0) {
            return options;
          }

          const selectAllOption: Project = {
            id: SELECT_ALL_ID,
            name:
              selectedProjects.length === (projects?.length ?? 0) ? "Deselect all" : "Select all",
            clientId: null,
            clientName: null,
            active: true,
            billable: false,
            color: null,
            currency: null,
            rateCents: null,
          };

          return [selectAllOption, ...options];
        }}
        getOptionKey={(option) => option.id}
        renderOption={({ key, ...props }, option, { selected }) => {
          const isSelectAll = option.id === SELECT_ALL_ID;
          const allSelected = selectedProjects.length === (projects?.length ?? 0);

          return (
            <li key={key} {...props}>
              <Checkbox
                size="small"
                checked={isSelectAll ? allSelected : selected}
                indeterminate={isSelectAll && selectedProjects.length > 0 && !allSelected}
                sx={{ mr: 1 }}
              />
              <Typography variant="body2" fontWeight={isSelectAll ? 600 : 400}>
                {option.name}
              </Typography>
              {!isSelectAll && option.clientName && (
                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                  {option.clientName}
                </Typography>
              )}
            </li>
          );
        }}
        renderValue={(value, getTagProps) =>
          value.map((option, index) => {
            const { key, ...rest } = getTagProps({ index });

            return (
              <Chip
                key={key}
                label={option.name}
                size="small"
                {...rest}
                sx={{
                  bgcolor: option.color ? `${option.color}20` : undefined,
                }}
              />
            );
          })
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Projects"
            placeholder={selectedProjects.length === 0 ? "All projects" : ""}
            slotProps={{
              input: {
                ...params.InputProps,
                endAdornment: (
                  <>
                    {projectsLoading && <CircularProgress size={18} />}
                    {params.InputProps.endAdornment}
                  </>
                ),
              },
            }}
          />
        )}
      />

      <ImportSettings
        capabilities={provider.capabilities}
        grouping={grouping}
        subGrouping={subGrouping}
        roundingMinutes={roundingMinutes}
        rateSource={rateSource}
        customRate={customRateCents}
        onGroupingChange={onGroupingChange}
        onSubGroupingChange={onSubGroupingChange}
        onRoundingChange={onRoundingChange}
        onRateSourceChange={onRateSourceChange}
        onCustomRateChange={onCustomRateChange}
      />

      <Button
        variant="outlined"
        onClick={onSearch}
        disabled={!workspaceId || isSearching}
        startIcon={isSearching ? <CircularProgress size={16} /> : undefined}
      >
        {isSearching ? "Loading..." : "Load time entries"}
      </Button>
    </>
  );
}
