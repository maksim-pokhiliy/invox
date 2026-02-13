"use client";

import type { UseFormRegister } from "react-hook-form";

import {
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";

import { DISCOUNT_NONE, DISCOUNT_TYPE } from "@app/shared/config/invoice-status";
import type { RecurringFormData } from "@app/shared/schemas";

interface RecurringFormDiscountsProps {
  register: UseFormRegister<RecurringFormData>;
  discountType: string;
  currency: string;
}

export function RecurringFormDiscounts({
  register,
  discountType,
  currency,
}: RecurringFormDiscountsProps) {
  return (
    <>
      <Paper sx={{ p: 4, borderRadius: 3, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 3 }}>
          Discounts & Taxes
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Discount Type</InputLabel>
              <Select
                {...register("discountType")}
                label="Discount Type"
                defaultValue={DISCOUNT_NONE}
              >
                <MenuItem value={DISCOUNT_NONE}>No Discount</MenuItem>
                <MenuItem value={DISCOUNT_TYPE.PERCENTAGE}>Percentage</MenuItem>
                <MenuItem value={DISCOUNT_TYPE.FIXED}>Fixed Amount</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {discountType !== DISCOUNT_NONE && (
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                {...register("discountValue", { valueAsNumber: true })}
                label={discountType === DISCOUNT_TYPE.PERCENTAGE ? "Discount %" : "Discount Amount"}
                type="number"
                slotProps={{
                  htmlInput: { min: 0, step: discountType === DISCOUNT_TYPE.PERCENTAGE ? 1 : 0.01 },
                  input: {
                    endAdornment:
                      discountType === DISCOUNT_TYPE.PERCENTAGE ? (
                        <InputAdornment position="end">%</InputAdornment>
                      ) : (
                        <InputAdornment position="start">{currency}</InputAdornment>
                      ),
                  },
                }}
              />
            </Grid>
          )}

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              {...register("taxRate", { valueAsNumber: true })}
              label="Tax Rate"
              type="number"
              slotProps={{
                htmlInput: { min: 0, max: 100, step: 0.1 },
                input: { endAdornment: <InputAdornment position="end">%</InputAdornment> },
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 4, borderRadius: 3, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 3 }}>
          Notes
        </Typography>

        <TextField
          {...register("notes")}
          label="Notes (Optional)"
          multiline
          rows={3}
          fullWidth
          placeholder="Additional notes that will appear on every invoice"
        />
      </Paper>
    </>
  );
}
