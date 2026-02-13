"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";

import {
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";

import { CURRENCIES } from "@app/shared/config/currencies";
import type { TemplateFormData } from "@app/shared/schemas";

import { DiscountAndTaxFields } from "./discount-and-tax-fields";

interface TemplateFormDetailsProps {
  register: UseFormRegister<TemplateFormData>;
  errors: FieldErrors<TemplateFormData>;
  currency: string;
  discountType: string | undefined;
}

export function TemplateFormDetails({
  register,
  errors,
  currency,
  discountType,
}: TemplateFormDetailsProps) {
  return (
    <Paper sx={{ p: 4, mb: 3, borderRadius: 3 }}>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
        Template Details
      </Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            label="Template Name"
            fullWidth
            {...register("name")}
            error={!!errors.name}
            helperText={errors.name?.message}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField label="Description (optional)" fullWidth {...register("description")} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl fullWidth error={!!errors.currency}>
            <InputLabel>Currency</InputLabel>
            <Select label="Currency" {...register("currency")}>
              {CURRENCIES.map((c) => (
                <MenuItem key={c.value} value={c.value}>
                  {c.label}
                </MenuItem>
              ))}
            </Select>
            {errors.currency && <FormHelperText>{errors.currency.message}</FormHelperText>}
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            label="Due Days"
            type="number"
            fullWidth
            {...register("dueDays", { valueAsNumber: true })}
            error={!!errors.dueDays}
            helperText={errors.dueDays?.message || "Days until due from creation"}
          />
        </Grid>
        <DiscountAndTaxFields register={register} discountType={discountType} currency={currency} />
      </Grid>
    </Paper>
  );
}
