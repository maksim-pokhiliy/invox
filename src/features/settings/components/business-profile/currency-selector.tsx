"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";

import {
  FormControl,
  FormHelperText,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { CURRENCIES } from "@app/shared/config/currencies";
import type { SenderProfileFormInput } from "@app/shared/schemas";

interface CurrencySelectorProps {
  register: UseFormRegister<SenderProfileFormInput>;
  errors: FieldErrors<SenderProfileFormInput>;
  currentValue: string;
}

export function CurrencySelector({ register, errors, currentValue }: CurrencySelectorProps) {
  return (
    <>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
        Invoice Defaults
      </Typography>
      <Stack direction="column" spacing={3} sx={{ maxWidth: 300 }}>
        <FormControl fullWidth error={!!errors.defaultCurrency}>
          <InputLabel id="currency-label">Default Currency</InputLabel>
          <Select
            {...register("defaultCurrency")}
            labelId="currency-label"
            label="Default Currency"
            value={currentValue || "USD"}
          >
            {CURRENCIES.map((c) => (
              <MenuItem key={c.value} value={c.value}>
                {c.label}
              </MenuItem>
            ))}
          </Select>
          {errors.defaultCurrency && (
            <FormHelperText>{errors.defaultCurrency.message}</FormHelperText>
          )}
        </FormControl>
        <TextField
          {...register("defaultRate", { valueAsNumber: true })}
          type="number"
          label="Default Hourly Rate"
          fullWidth
          slotProps={{
            htmlInput: { min: 0, step: 0.01 },
            input: {
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            },
          }}
          error={!!errors.defaultRate}
          helperText={
            errors.defaultRate?.message || "Auto-fills unit price for new invoice line items"
          }
        />
      </Stack>
    </>
  );
}
