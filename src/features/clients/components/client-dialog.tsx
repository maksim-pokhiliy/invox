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
} from "@mui/material";
import { LoadingButton } from "@app/shared/ui/loading-button";
import { useToast } from "@app/shared/ui/toast";
import { useCreateClient, useUpdateClient } from "@app/features/clients";
import { ApiError } from "@app/shared/api";
import { createClientSchema, CreateClientInput } from "@app/shared/schemas";

interface ClientDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  client?: { id: string; name: string; email: string };
}

export function ClientDialog({ open, onClose, mode, client }: ClientDialogProps) {
  const toast = useToast();
  const [error, setError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateClientInput>({
    resolver: zodResolver(createClientSchema),
    defaultValues: {
      name: client?.name || "",
      email: client?.email || "",
    },
  });

  React.useEffect(() => {
    if (open) {
      reset({
        name: client?.name || "",
        email: client?.email || "",
      });
      setError(null);
    }
  }, [open, client, reset]);

  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();

  const onSubmit = (data: CreateClientInput) => {
    setError(null);
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
