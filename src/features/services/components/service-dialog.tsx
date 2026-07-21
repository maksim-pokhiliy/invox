"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";

import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  InputAdornment,
  Switch,
  TextField,
} from "@mui/material";

import { zodResolver } from "@hookform/resolvers/zod";

import { extractApiErrorMessage } from "@app/shared/api";
import { type FormMode } from "@app/shared/config/config";
import { useIsMobileDialog } from "@app/shared/hooks/use-is-mobile-dialog";
import { useToast } from "@app/shared/hooks/use-toast";
import {
  type CreateServiceInput,
  type Service,
  ServiceFormInput,
  serviceFormSchema,
} from "@app/shared/schemas";
import { fromDollars, toDollars } from "@app/shared/types/money";
import { LoadingButton } from "@app/shared/ui/loading-button";

import { useCreateService, useUpdateService } from "../hooks";

const UNIT_SUGGESTIONS = ["hour", "day", "piece", "project", "flat rate"];

interface ServiceDialogProps {
  open: boolean;
  onClose: () => void;
  mode: FormMode;
  service?: Pick<Service, "id" | "name" | "description" | "unit" | "defaultPrice" | "active">;
}

export function ServiceDialog({ open, onClose, mode, service }: ServiceDialogProps) {
  const toast = useToast();
  const isMobile = useIsMobileDialog();
  const [error, setError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<ServiceFormInput>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: service?.name || "",
      description: service?.description || "",
      unit: service?.unit || "",
      defaultPrice: service?.defaultPrice ? toDollars(service.defaultPrice) : undefined,
      active: service?.active ?? true,
    },
  });

  React.useEffect(() => {
    if (open) {
      reset({
        name: service?.name || "",
        description: service?.description || "",
        unit: service?.unit || "",
        defaultPrice: service?.defaultPrice ? toDollars(service.defaultPrice) : undefined,
        active: service?.active ?? true,
      });
    }
  }, [open, service, reset]);

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const createMutation = useCreateService();
  const updateMutation = useUpdateService();

  const onSubmit = (formData: ServiceFormInput) => {
    setError(null);
    const data = {
      ...formData,
      defaultPrice: fromDollars(formData.defaultPrice || 0),
      active: getValues("active"),
    } as CreateServiceInput;

    if (mode === "create") {
      createMutation.mutate(data, {
        onSuccess: () => {
          toast.success("Service created successfully!");
          reset();
          onClose();
        },
        onError: (err) => {
          setError(extractApiErrorMessage(err, "Failed to create service"));
        },
      });
    } else if (service) {
      updateMutation.mutate(
        { id: service.id, data },
        {
          onSuccess: () => {
            toast.success("Service updated successfully!");
            onClose();
          },
          onError: (err) => {
            setError(extractApiErrorMessage(err, "Failed to update service"));
          },
        }
      );
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth fullScreen={isMobile}>
      <DialogTitle sx={{ fontWeight: 600 }}>
        {mode === "create" ? "Add New Service" : "Edit Service"}
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            {...register("name")}
            label="Service Name"
            fullWidth
            margin="normal"
            error={!!errors.name}
            helperText={errors.name?.message}
          />
          <TextField
            {...register("description")}
            label="Description"
            fullWidth
            margin="normal"
            multiline
            rows={2}
            error={!!errors.description}
            helperText={errors.description?.message}
          />
          <Autocomplete
            freeSolo
            options={UNIT_SUGGESTIONS}
            value={typeof service?.unit === "string" ? service.unit : ""}
            onInputChange={(_, value) => setValue("unit", value)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Unit"
                margin="normal"
                error={!!errors.unit}
                helperText={errors.unit?.message || "e.g. hour, day, piece, project"}
              />
            )}
          />
          <TextField
            {...register("defaultPrice", { valueAsNumber: true })}
            type="number"
            label="Default Price"
            fullWidth
            margin="normal"
            slotProps={{
              htmlInput: { min: 0, step: 0.01 },
              input: {
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              },
            }}
            error={!!errors.defaultPrice}
            helperText={errors.defaultPrice?.message}
          />
          <Controller
            name="active"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                }
                label="Active"
                sx={{ mt: 1 }}
              />
            )}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isPending}>
            {mode === "create" ? "Add Service" : "Save Changes"}
          </LoadingButton>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
