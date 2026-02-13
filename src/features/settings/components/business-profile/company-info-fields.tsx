"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";

import { Divider, Grid, TextField, Typography } from "@mui/material";

import type { SenderProfileFormInput } from "@app/shared/schemas";

interface CompanyInfoFieldsProps {
  register: UseFormRegister<SenderProfileFormInput>;
  errors: FieldErrors<SenderProfileFormInput>;
}

export function CompanyInfoFields({ register, errors }: CompanyInfoFieldsProps) {
  return (
    <>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
        Company Information
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            {...register("companyName")}
            label="Company Name"
            fullWidth
            error={!!errors.companyName}
            helperText={errors.companyName?.message || "Your business or company name"}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            {...register("displayName")}
            label="Display Name"
            fullWidth
            error={!!errors.displayName}
            helperText={errors.displayName?.message || "Your personal name (if not using company)"}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />
    </>
  );
}
