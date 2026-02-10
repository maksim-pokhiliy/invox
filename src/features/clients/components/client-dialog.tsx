"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  TextField,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
} from "@mui/material";
import { LoadingButton } from "@app/shared/ui/loading-button";
import { useToast } from "@app/shared/ui/toast";
import { useCreateClient, useUpdateClient } from "@app/features/clients";
import { ApiError } from "@app/shared/api";
import { clientFormSchema, ClientFormInput } from "@app/shared/schemas";

interface ClientDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  client?: { id: string; name: string; email: string; defaultRate?: number | null };
}

export function ClientDialog({ open, onClose, mode, client }: ClientDialogProps) {
  const toast = useToast();
  const [error, setError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormInput>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: client?.name || "",
      email: client?.email || "",
      defaultRate: client?.defaultRate ? client.defaultRate / 100 : undefined,
    },
  });

  React.useEffect(() => {
    if (open) {
      reset({
        name: client?.name || "",
        email: client?.email || "",
        defaultRate: client?.defaultRate ? client.defaultRate / 100 : undefined,
      });
      setError(null);
    }
  }, [open, client, reset]);

  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();

  const onSubmit = (formData: ClientFormInput) => {
    setError(null);
    const data = {
      ...formData,
      defaultRate: formData.defaultRate ? Math.round(formData.defaultRate * 100) : undefined,
    };
    if (mode === "create") {
      createMutation.mutate(data, {
        onSuccess: () => {
          toast.success("Client created successfully!");
          reset();
          onClose();
        },
        onError: (err) => {
          setError(err instanceof ApiError ? err.message : "Failed to create client");
        },
      });
    } else if (client) {
      updateMutation.mutate(
        { id: client.id, data },
        {
          onSuccess: () => {
            toast.success("Client updated successfully!");
            onClose();
          },
          onError: (err) => {
            setError(err instanceof ApiError ? err.message : "Failed to update client");
          },
        }
      );
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>
        {mode === "create" ? "Add New Client" : "Edit Client"}
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
            label="Client Name"
            fullWidth
            margin="normal"
            error={!!errors.name}
            helperText={errors.name?.message}
          />
          <TextField
            {...register("email")}
            label="Client Email"
            type="email"
            fullWidth
            margin="normal"
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          <TextField
            {...register("defaultRate", { valueAsNumber: true })}
            type="number"
            label="Default Hourly Rate"
            fullWidth
            margin="normal"
            slotProps={{
              htmlInput: { min: 0, step: 0.01 },
              input: {
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              },
            }}
            error={!!errors.defaultRate}
            helperText={
              errors.defaultRate?.message || "Overrides account default rate for this client"
            }
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isPending}>
            {mode === "create" ? "Add Client" : "Save Changes"}
          </LoadingButton>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
