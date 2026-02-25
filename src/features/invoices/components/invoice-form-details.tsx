"use client";

import { Control, Controller, FieldErrors, UseFormRegister } from "react-hook-form";

import {
  Button,
  Divider,
  FormControl,
  Grid,
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
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
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
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
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
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
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
        </Grid>
      </Grid>

      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
        Billing Period
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="periodStart"
            control={control}
            render={({ field }) => (
              <DatePicker
                label="Period Start"
                value={field.value ? dayjs(field.value) : null}
                onChange={(date) => field.onChange(date?.format("YYYY-MM-DD") || "")}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.periodStart,
                    helperText: errors.periodStart?.message,
                  },
                }}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="periodEnd"
            control={control}
            render={({ field }) => (
              <DatePicker
                label="Period End"
                value={field.value ? dayjs(field.value) : null}
                onChange={(date) => field.onChange(date?.format("YYYY-MM-DD") || "")}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.periodEnd,
                    helperText: errors.periodEnd?.message,
                  },
                }}
              />
            )}
          />
        </Grid>
      </Grid>

      <TextField
        {...register("message")}
        label="Message to Client"
        placeholder="Thank you for your business!"
        fullWidth
        multiline
        rows={3}
        sx={{ mb: 3 }}
        helperText="This message will be visible on the invoice sent to the client"
      />

      <TextField
        {...register("notes")}
        label="Internal Notes"
        placeholder="Add notes for yourself (not visible to client)"
        fullWidth
        multiline
        rows={3}
        helperText="These notes are for your reference only and won't be shown on the invoice"
      />

      <Divider sx={{ my: 4 }} />
    </>
  );
}
