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
  Grid,
  MenuItem,
  IconButton,
  Divider,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  InputAdornment,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import { AppLayout } from "@app/shared/layout/app-layout";
import { Breadcrumbs } from "@app/shared/ui/breadcrumbs";
import { Spinner } from "@app/shared/ui/loading";
import { useToast } from "@app/shared/ui/toast";
import { useCreateTemplate } from "@app/features/templates";
import { ApiError } from "@app/shared/api";

const currencies = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "CHF", "CNY", "RUB"];

const templateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  currency: z.string().min(1, "Currency is required"),
  discountType: z.enum(["PERCENTAGE", "FIXED", ""]).optional(),
  discountValue: z.number().min(0).optional(),
  taxRate: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
  dueDays: z.number().min(1, "Due days must be at least 1"),
  items: z
    .array(
      z.object({
        description: z.string().min(1, "Description is required"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
        unitPrice: z.number().min(0, "Price must be positive"),
      })
    )
    .min(1, "At least one item is required"),
});

type TemplateFormData = z.infer<typeof templateSchema>;

export default function NewTemplatePage() {
  const router = useRouter();
  const toast = useToast();
  const createMutation = useCreateTemplate();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: "",
      description: "",
      currency: "USD",
      discountType: "",
      discountValue: 0,
      taxRate: 0,
      notes: "",
      dueDays: 30,
      items: [{ description: "", quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const currency = watch("currency");

  const onSubmit = (data: TemplateFormData) => {
    const submitData = {
      name: data.name,
      description: data.description || undefined,
      currency: data.currency,
      discount:
        data.discountType && data.discountValue
          ? {
              type: data.discountType as "PERCENTAGE" | "FIXED",
              value:
                data.discountType === "FIXED"
                  ? Math.round(data.discountValue * 100)
                  : data.discountValue,
            }
          : undefined,
      taxRate: data.taxRate || undefined,
      notes: data.notes || undefined,
      dueDays: data.dueDays,
      items: data.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: Math.round(item.unitPrice * 100),
      })),
    };

    createMutation.mutate(submitData, {
      onSuccess: () => {
        toast.success("Template created successfully!");
        router.push("/app/templates");
      },
      onError: (err) => {
        toast.error(err instanceof ApiError ? err.message : "Failed to create template");
      },
    });
  };

  return (
    <AppLayout>
      <Breadcrumbs
        items={[{ label: "Templates", href: "/app/templates" }, { label: "New Template" }]}
      />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight={700}>
          Create Template
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Create a reusable template for common invoices
        </Typography>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
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
                <Select label="Currency" defaultValue="USD" {...register("currency")}>
                  {currencies.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
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
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Discount Type</InputLabel>
                <Select label="Discount Type" defaultValue="" {...register("discountType")}>
                  <MenuItem value="">No Discount</MenuItem>
                  <MenuItem value="PERCENTAGE">Percentage (%)</MenuItem>
                  <MenuItem value="FIXED">Fixed Amount</MenuItem>
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
                    startAdornment: watch("discountType") === "FIXED" && (
                      <InputAdornment position="start">{currency}</InputAdornment>
                    ),
                    endAdornment: watch("discountType") === "PERCENTAGE" && (
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
                  input: {
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  },
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
          </Grid>
        </Paper>

        <Paper sx={{ p: 4, mb: 3, borderRadius: 3 }}>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}
          >
            <Typography variant="h6" fontWeight={600}>
              Line Items
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => append({ description: "", quantity: 1, unitPrice: 0 })}
            >
              Add Item
            </Button>
          </Box>

          {errors.items?.root && (
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
              {errors.items.root.message}
            </Typography>
          )}

          {fields.map((field, index) => (
            <Box key={field.id}>
              {index > 0 && <Divider sx={{ my: 2 }} />}
              <Grid container spacing={2} alignItems="flex-start">
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Description"
                    fullWidth
                    {...register(`items.${index}.description`)}
                    error={!!errors.items?.[index]?.description}
                    helperText={errors.items?.[index]?.description?.message}
                  />
                </Grid>
                <Grid size={{ xs: 6, md: 2 }}>
                  <TextField
                    label="Quantity"
                    type="number"
                    fullWidth
                    {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                    error={!!errors.items?.[index]?.quantity}
                    helperText={errors.items?.[index]?.quantity?.message}
                  />
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <TextField
                    label="Unit Price"
                    type="number"
                    fullWidth
                    {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                    error={!!errors.items?.[index]?.unitPrice}
                    helperText={errors.items?.[index]?.unitPrice?.message}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">{currency}</InputAdornment>
                        ),
                      },
                    }}
                  />
                </Grid>
                <Grid
                  size={{ xs: 12, md: 1 }}
                  sx={{ display: "flex", justifyContent: "center", pt: 1 }}
                >
                  <IconButton
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                    color="error"
                    aria-label="Remove item"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </Box>
          ))}
        </Paper>

        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <Button variant="outlined" onClick={() => router.push("/app/templates")}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={createMutation.isPending ? <Spinner size={16} /> : <SaveIcon />}
            disabled={createMutation.isPending}
          >
            Create Template
          </Button>
        </Box>
      </form>
    </AppLayout>
  );
}
