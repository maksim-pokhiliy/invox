"use client";

import {
  FormControl,
  FormControlLabel,
  FormLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
} from "@mui/material";

import { CURRENCY, UI } from "@app/shared/config/config";

import type { ProviderInfo } from "../api";
import { BREAKDOWN_LABELS, RATE_SOURCE, type RateSource, ROUNDING_LABELS } from "../constants";

interface ImportSettingsProps {
  capabilities: ProviderInfo["capabilities"];
  grouping: string;
  subGrouping: string;
  roundingMinutes: number;
  rateSource: RateSource;
  customRate: number;
  onGroupingChange: (value: string) => void;
  onSubGroupingChange: (value: string) => void;
  onRoundingChange: (value: number) => void;
  onRateSourceChange: (value: RateSource) => void;
  onCustomRateChange: (value: number) => void;
}

export function ImportSettings({
  capabilities,
  grouping,
  subGrouping,
  roundingMinutes,
  rateSource,
  customRate,
  onGroupingChange,
  onSubGroupingChange,
  onRoundingChange,
  onRateSourceChange,
  onCustomRateChange,
}: ImportSettingsProps) {
  const groupingOptions = ["none", ...capabilities.breakdownOptions];

  const subGroupingOptions =
    grouping === "none"
      ? capabilities.breakdownOptions
      : (capabilities.allowedCombinations[grouping] ?? []);

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Breakdown by</InputLabel>
          <Select
            value={grouping}
            label="Breakdown by"
            onChange={(e) => {
              onGroupingChange(e.target.value);
              const newSubs =
                e.target.value === "none"
                  ? capabilities.breakdownOptions
                  : (capabilities.allowedCombinations[e.target.value] ?? []);

              if (!newSubs.includes(subGrouping)) {
                onSubGroupingChange(newSubs[0] ?? "descriptions");
              }
            }}
          >
            {groupingOptions.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt === "none" ? "None" : (BREAKDOWN_LABELS[opt] ?? opt)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>And</InputLabel>
          <Select
            value={subGrouping}
            label="And"
            onChange={(e) => onSubGroupingChange(e.target.value)}
          >
            {subGroupingOptions.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {BREAKDOWN_LABELS[opt] ?? opt}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Rounding</InputLabel>
          <Select
            value={roundingMinutes}
            label="Rounding"
            onChange={(e) => onRoundingChange(Number(e.target.value))}
          >
            {capabilities.roundingOptions.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {ROUNDING_LABELS[opt] ?? `${opt} min`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <Stack direction="row" spacing={2} alignItems="center">
        <FormControl>
          <FormLabel sx={{ typography: "body2", fontWeight: 600 }}>Rate</FormLabel>
          <RadioGroup
            row
            value={rateSource}
            onChange={(e) => onRateSourceChange(e.target.value as RateSource)}
          >
            {capabilities.hasBillableRates && (
              <FormControlLabel
                value={RATE_SOURCE.PROVIDER}
                control={<Radio size="small" />}
                label="Toggl"
              />
            )}
            <FormControlLabel
              value={RATE_SOURCE.GETPAID}
              control={<Radio size="small" />}
              label="GetPaid"
            />
            <FormControlLabel
              value={RATE_SOURCE.CUSTOM}
              control={<Radio size="small" />}
              label="Custom"
            />
          </RadioGroup>
        </FormControl>

        {rateSource === RATE_SOURCE.CUSTOM && (
          <TextField
            size="small"
            type="number"
            label="Rate/hr"
            value={customRate / CURRENCY.CENTS_MULTIPLIER || ""}
            onChange={(e) =>
              onCustomRateChange(Math.round(Number(e.target.value) * CURRENCY.CENTS_MULTIPLIER))
            }
            slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
            sx={{ width: UI.FIELD_WIDTH_RATE }}
          />
        )}
      </Stack>
    </Stack>
  );
}
