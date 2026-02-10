"use client";

import {
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  TextField,
  Typography,
  InputAdornment,
} from "@mui/material";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { SenderProfileFormInput } from "@app/shared/schemas";
import { CURRENCIES } from "@app/shared/config/currencies";

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
      <Box sx={{ display: "grid", gap: 3, maxWidth: 300 }}>
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
      </Box>
    </>
  );
}
