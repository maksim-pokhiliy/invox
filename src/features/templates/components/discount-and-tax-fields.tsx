"use client";

import type { UseFormRegister } from "react-hook-form";

import {
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";

import { DISCOUNT_TYPE } from "@app/shared/config/invoice-status";
import type { TemplateFormData } from "@app/shared/schemas";

interface DiscountAndTaxFieldsProps {
  register: UseFormRegister<TemplateFormData>;
  discountType: string | undefined;
  currency: string;
}

export function DiscountAndTaxFields({
  register,
  discountType,
  currency,
}: DiscountAndTaxFieldsProps) {
  return (
    <>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Discount Type</InputLabel>
          <Select label="Discount Type" defaultValue="" {...register("discountType")}>
            <MenuItem value="">No Discount</MenuItem>
            <MenuItem value={DISCOUNT_TYPE.PERCENTAGE}>Percentage (%)</MenuItem>
            <MenuItem value={DISCOUNT_TYPE.FIXED}>Fixed Amount</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <TextField
          label="Discount Value"
          type="number"
          fullWidth
          {...register("discountValue", { valueAsNumber: true })}
          slotProps={{
            input: {
              startAdornment: discountType === DISCOUNT_TYPE.FIXED && (
                <InputAdornment position="start">{currency}</InputAdornment>
              ),
              endAdornment: discountType === DISCOUNT_TYPE.PERCENTAGE && (
                <InputAdornment position="end">%</InputAdornment>
              ),
            },
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <TextField
          label="Tax Rate (%)"
          type="number"
          fullWidth
          {...register("taxRate", { valueAsNumber: true })}
          slotProps={{
            input: { endAdornment: <InputAdornment position="end">%</InputAdornment> },
          }}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TextField
          label="Notes (optional)"
          multiline
          rows={2}
          fullWidth
          {...register("notes")}
          placeholder="Default notes to include on invoices"
        />
      </Grid>
    </>
  );
}
