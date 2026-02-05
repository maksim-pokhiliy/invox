"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  IconButton,
  Divider,
  Switch,
  FormControlLabel,
  alpha,
  useTheme,
  InputAdornment,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { AppLayout } from "@app/components/layout/AppLayout";
import { Breadcrumbs } from "@app/components/navigation/Breadcrumbs";
import { PageLoader, Spinner } from "@app/components/feedback/Loading";
import { useToast } from "@app/components/feedback/Toast";
import { useClients, useCreateRecurring, ApiError } from "@app/lib/api";

const currencies = [
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "GBP", label: "GBP" },
];

const frequencies = [
  { value: "WEEKLY", label: "Weekly" },
  { value: "BIWEEKLY", label: "Bi-weekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "QUARTERLY", label: "Quarterly" },
  { value: "YEARLY", label: "Yearly" },
];

const recurringSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  name: z.string().min(1, "Name is required"),
  frequency: z.enum(["WEEKLY", "BIWEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"]),
  currency: z.string(),
  discountType: z.enum(["PERCENTAGE", "FIXED", "NONE"]),
  discountValue: z.number().min(0),
  taxRate: z.number().min(0).max(100),
  notes: z.string().optional(),
  dueDays: z.number().min(1).max(365),
  autoSend: z.boolean(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  items: z
    .array(
      z.object({
        description: z.string().min(1, "Description is required"),
        quantity: z.number().min(1),
        unitPrice: z.number().min(0),
      })
    )
    .min(1, "At least one item is required"),
});

type RecurringFormData = z.infer<typeof recurringSchema>;

export default function NewRecurringPage() {
  const theme = useTheme();
  const router = useRouter();
  const toast = useToast();
  const { data: clients, isLoading: clientsLoading } = useClients();
  const createMutation = useCreateRecurring();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<RecurringFormData>({
    resolver: zodResolver(recurringSchema),
    defaultValues: {
      clientId: "",
      name: "",
      frequency: "MONTHLY",
      currency: "USD",
      discountType: "NONE",
      discountValue: 0,
      taxRate: 0,
      notes: "",
      dueDays: 30,
      autoSend: false,
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      items: [{ description: "", quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const currency = watch("currency");
  const discountType = watch("discountType");
  const items = watch("items");

  const subtotal = items.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
    0
  );

  const onSubmit = (data: RecurringFormData) => {
    const submitData = {
      clientId: data.clientId,
      name: data.name,
      frequency: data.frequency,
      currency: data.currency,
      discount:
        data.discountType !== "NONE"
          ? { type: data.discountType as "PERCENTAGE" | "FIXED", value: data.discountValue }
          : undefined,
      taxRate: data.taxRate,
      notes: data.notes || undefined,
      dueDays: data.dueDays,
      autoSend: data.autoSend,
      startDate: data.startDate,
      endDate: data.endDate || undefined,
      items: data.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: Math.round(item.unitPrice * 100),
      })),
    };

    createMutation.mutate(submitData, {
      onSuccess: () => {
        toast.success("Recurring invoice created");
        router.push("/app/recurring");
      },
      onError: (err) => {
        toast.error(err instanceof ApiError ? err.message : "Failed to create recurring invoice");
      },
    });
  };

  if (clientsLoading) {
    return (
      <AppLayout>
        <PageLoader message="Loading..." />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Breadcrumbs
        items={[{ label: "Recurring Invoices", href: "/app/recurring" }, { label: "New" }]}
      />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight={700}>
          New Recurring Invoice
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Set up automatic invoice generation
        </Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Paper sx={{ p: 4, borderRadius: 3, mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 3 }}>
            Schedule Details
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 3,
              mb: 3,
            }}
          >
            <TextField
              {...register("name")}
              label="Schedule Name"
              placeholder="e.g., Monthly Retainer - Acme Corp"
              fullWidth
              error={!!errors.name}
              helperText={errors.name?.message}
            />

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

            <FormControl fullWidth>
              <InputLabel>Frequency</InputLabel>
              <Select {...register("frequency")} label="Frequency" defaultValue="MONTHLY">
                {frequencies.map((f) => (
                  <MenuItem key={f.value} value={f.value}>
                    {f.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Currency</InputLabel>
              <Select {...register("currency")} label="Currency" defaultValue="USD">
                {currencies.map((c) => (
                  <MenuItem key={c.value} value={c.value}>
                    {c.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              {...register("startDate")}
              label="Start Date"
              type="date"
              fullWidth
              error={!!errors.startDate}
              helperText={errors.startDate?.message}
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <TextField
              {...register("endDate")}
              label="End Date (Optional)"
              type="date"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              helperText="Leave empty for indefinite"
            />

            <TextField
              {...register("dueDays", { valueAsNumber: true })}
              label="Days Until Due"
              type="number"
              fullWidth
              error={!!errors.dueDays}
              helperText={errors.dueDays?.message || "Number of days from invoice date"}
              slotProps={{ htmlInput: { min: 1, max: 365 } }}
            />

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
          </Box>
        </Paper>

        <Paper sx={{ p: 4, borderRadius: 3, mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 3 }}>
            Line Items
          </Typography>

          {fields.map((field, index) => (
            <Box
              key={field.id}
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "2fr 1fr 1fr auto" },
                gap: 2,
                mb: 2,
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.background.default, 0.5),
              }}
            >
              <TextField
                {...register(`items.${index}.description`)}
                label="Description"
                size="small"
                error={!!errors.items?.[index]?.description}
                helperText={errors.items?.[index]?.description?.message}
              />
              <TextField
                {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                label="Quantity"
                type="number"
                size="small"
                slotProps={{ htmlInput: { min: 1 } }}
              />
              <TextField
                {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                label="Unit Price"
                type="number"
                size="small"
                slotProps={{
                  htmlInput: { min: 0, step: 0.01 },
                  input: {
                    startAdornment: <InputAdornment position="start">{currency}</InputAdornment>,
                  },
                }}
              />
              <IconButton
                onClick={() => remove(index)}
                disabled={fields.length === 1}
                sx={{ alignSelf: "center" }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}

          <Button
            startIcon={<AddIcon />}
            onClick={() => append({ description: "", quantity: 1, unitPrice: 0 })}
          >
            Add Item
          </Button>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Typography variant="body1">
              Subtotal:{" "}
              <strong>
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency,
                }).format(subtotal)}
              </strong>
            </Typography>
          </Box>
        </Paper>

        <Paper sx={{ p: 4, borderRadius: 3, mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 3 }}>
            Discounts & Taxes
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
              gap: 3,
            }}
          >
            <FormControl fullWidth>
              <InputLabel>Discount Type</InputLabel>
              <Select {...register("discountType")} label="Discount Type" defaultValue="NONE">
                <MenuItem value="NONE">No Discount</MenuItem>
                <MenuItem value="PERCENTAGE">Percentage</MenuItem>
                <MenuItem value="FIXED">Fixed Amount</MenuItem>
              </Select>
            </FormControl>

            {discountType !== "NONE" && (
              <TextField
                {...register("discountValue", { valueAsNumber: true })}
                label={discountType === "PERCENTAGE" ? "Discount %" : "Discount Amount"}
                type="number"
                slotProps={{
                  htmlInput: { min: 0, step: discountType === "PERCENTAGE" ? 1 : 0.01 },
                  input: {
                    endAdornment:
                      discountType === "PERCENTAGE" ? (
                        <InputAdornment position="end">%</InputAdornment>
                      ) : (
                        <InputAdornment position="start">{currency}</InputAdornment>
                      ),
                  },
                }}
              />
            )}

            <TextField
              {...register("taxRate", { valueAsNumber: true })}
              label="Tax Rate"
              type="number"
              slotProps={{
                htmlInput: { min: 0, max: 100, step: 0.1 },
                input: { endAdornment: <InputAdornment position="end">%</InputAdornment> },
              }}
            />
          </Box>
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

        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <Button variant="outlined" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={createMutation.isPending}
            sx={{ minWidth: 150 }}
          >
            {createMutation.isPending ? <Spinner size={20} /> : "Create Schedule"}
          </Button>
        </Box>
      </Box>
    </AppLayout>
  );
}
