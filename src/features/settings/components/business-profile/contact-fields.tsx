"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";

import { Divider, Stack, TextField, Typography } from "@mui/material";

import type { SenderProfileFormInput } from "@app/shared/schemas";

interface ContactFieldsProps {
  register: UseFormRegister<SenderProfileFormInput>;
  errors: FieldErrors<SenderProfileFormInput>;
}

export function ContactFields({ register, errors }: ContactFieldsProps) {
  return (
    <>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
        Contact & Address
      </Typography>
      <Stack direction="column" spacing={3} sx={{ mb: 4 }}>
        <TextField
          {...register("emailFrom")}
          label="Reply-to Email"
          type="email"
          fullWidth
          error={!!errors.emailFrom}
          helperText={errors.emailFrom?.message || "Email where clients can reply"}
        />
        <TextField
          {...register("address")}
          label="Business Address"
          fullWidth
          multiline
          rows={2}
          error={!!errors.address}
          helperText={errors.address?.message || "Will appear on your invoices"}
        />
        <TextField
          {...register("taxId")}
          label="Tax ID / VAT Number"
          fullWidth
          error={!!errors.taxId}
          helperText={errors.taxId?.message || "Optional - displayed on invoices"}
        />
      </Stack>

      <Divider sx={{ my: 4 }} />
    </>
  );
}
