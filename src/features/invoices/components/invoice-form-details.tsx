"use client";

import { Control, Controller, FieldErrors, UseFormRegister } from "react-hook-form";

import {
  Box,
  Button,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import dayjs from "dayjs";

import { CURRENCIES } from "@app/shared/config/currencies";
import type { InvoiceFormInput } from "@app/shared/schemas";
import type { Client } from "@app/shared/schemas/api";

interface InvoiceFormDetailsProps {
  register: UseFormRegister<InvoiceFormInput>;
  control: Control<InvoiceFormInput>;
  errors: FieldErrors<InvoiceFormInput>;
  clients: Client[] | undefined;
  clientsLoading: boolean;
  onAddClient: () => void;
}

export function InvoiceFormDetails({
  register,
  control,
  errors,
  clients,
  clientsLoading,
  onAddClient,
}: InvoiceFormDetailsProps) {
  return (
    <>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
        Invoice Details
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
          gap: 3,
          mb: 4,
        }}
      >
        <FormControl fullWidth error={!!errors.clientId}>
          <InputLabel id="client-label">Client</InputLabel>
          <Controller
            name="clientId"
            control={control}
            render={({ field }) => (
              <Select {...field} labelId="client-label" label="Client" disabled={clientsLoading}>
                {clients?.map((client) => (
                  <MenuItem key={client.id} value={client.id}>
                    {client.name}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
          {errors.clientId && (
            <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
              {errors.clientId.message}
            </Typography>
          )}
          <Button size="small" onClick={onAddClient} sx={{ mt: 1, alignSelf: "flex-start" }}>
            + Add New Client
          </Button>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel id="currency-label">Currency</InputLabel>
          <Controller
            name="currency"
            control={control}
            render={({ field }) => (
              <Select {...field} labelId="currency-label" label="Currency">
                {CURRENCIES.map((c) => (
                  <MenuItem key={c.value} value={c.value}>
                    {c.label}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
        </FormControl>

        <Controller
          name="dueDate"
          control={control}
          render={({ field }) => (
            <DatePicker
              label="Due Date"
              value={field.value ? dayjs(field.value) : null}
              onChange={(date) => field.onChange(date?.format("YYYY-MM-DD") || "")}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!errors.dueDate,
                  helperText: errors.dueDate?.message,
                },
              }}
            />
          )}
        />
      </Box>

      <TextField
        {...register("notes")}
        label="Internal Notes"
        placeholder="Add notes for yourself (not visible to client)"
        fullWidth
        multiline
        rows={3}
        sx={{ mt: 3 }}
        helperText="These notes are for your reference only and won't be shown on the invoice"
      />

      <Divider sx={{ my: 4 }} />
    </>
  );
}
