"use client";

import { type Control, Controller, type FieldErrors, type UseFormRegister } from "react-hook-form";

import {
  Box,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import dayjs from "dayjs";

import { VALIDATION } from "@app/shared/config/config";
import { CURRENCIES } from "@app/shared/config/currencies";
import { FREQUENCIES } from "@app/shared/config/frequencies";
import type { RecurringFormData } from "@app/shared/schemas";
import type { Client } from "@app/shared/schemas/api";

interface RecurringFormScheduleProps {
  register: UseFormRegister<RecurringFormData>;
  errors: FieldErrors<RecurringFormData>;
  clients: Client[] | undefined;
  control: Control<RecurringFormData>;
}

export function RecurringFormSchedule({
  register,
  errors,
  clients,
  control,
}: RecurringFormScheduleProps) {
  return (
    <Paper sx={{ p: 4, borderRadius: 3, mb: 3 }}>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 3 }}>
        Schedule Details
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            {...register("name")}
            label="Schedule Name"
            placeholder="e.g., Monthly Retainer - Acme Corp"
            fullWidth
            error={!!errors.name}
            helperText={errors.name?.message}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth error={!!errors.clientId}>
            <InputLabel>Client</InputLabel>
            <Select {...register("clientId")} label="Client" defaultValue="">
              {clients?.map((client) => (
                <MenuItem key={client.id} value={client.id}>
                  {client.name}
                </MenuItem>
              ))}
            </Select>
            {errors.clientId && <FormHelperText>{errors.clientId.message}</FormHelperText>}
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth>
            <InputLabel>Frequency</InputLabel>
            <Select {...register("frequency")} label="Frequency" defaultValue="MONTHLY">
              {FREQUENCIES.map((f) => (
                <MenuItem key={f.value} value={f.value}>
                  {f.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth>
            <InputLabel>Currency</InputLabel>
            <Select {...register("currency")} label="Currency">
              {CURRENCIES.map((c) => (
                <MenuItem key={c.value} value={c.value}>
                  {c.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="startDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                label="Start Date"
                value={field.value ? dayjs(field.value) : null}
                onChange={(date) => field.onChange(date?.format("YYYY-MM-DD") || "")}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.startDate,
                    helperText: errors.startDate?.message,
                  },
                }}
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="endDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                label="End Date (Optional)"
                value={field.value ? dayjs(field.value) : null}
                onChange={(date) => field.onChange(date?.format("YYYY-MM-DD") || "")}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    helperText: "Leave empty for indefinite",
                  },
                }}
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            {...register("dueDays", { valueAsNumber: true })}
            label="Days Until Due"
            type="number"
            fullWidth
            error={!!errors.dueDays}
            helperText={errors.dueDays?.message || "Number of days from invoice date"}
            slotProps={{ htmlInput: { min: 1, max: VALIDATION.MAX_DUE_DAYS } }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormControlLabel
            control={<Switch {...register("autoSend")} />}
            label={
              <Box>
                <Typography variant="body2">Auto-send invoices</Typography>
                <Typography variant="caption" color="text.secondary">
                  Automatically send invoices when generated
                </Typography>
              </Box>
            }
            sx={{ alignItems: "flex-start", ml: 0 }}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}
