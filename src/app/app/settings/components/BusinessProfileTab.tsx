"use client";

import {
  Box,
  Button,
  TextField,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  Divider,
  Alert,
} from "@mui/material";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { senderProfileFormSchema, SenderProfileFormInput } from "@app/shared/schemas";
import { Spinner } from "@app/components/feedback/Loading";
import { useToast } from "@app/components/feedback/Toast";
import { useUpdateSenderProfile, ApiError } from "@app/lib/api";
import { CURRENCIES } from "@app/lib/constants";
import * as React from "react";
import type { SenderProfile } from "@app/shared/schemas/api";

interface BusinessProfileTabProps {
  profile: SenderProfile | undefined;
}

export function BusinessProfileTab({ profile }: BusinessProfileTabProps) {
  const toast = useToast();
  const [error, setError] = React.useState<string | null>(null);
  const updateProfileMutation = useUpdateSenderProfile();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    control,
    reset,
  } = useForm<SenderProfileFormInput>({
    resolver: zodResolver(senderProfileFormSchema),
    defaultValues: {
      companyName: "",
      displayName: "",
      emailFrom: "",
      address: "",
      taxId: "",
      defaultCurrency: "USD",
    },
  });

  React.useEffect(() => {
    if (profile) {
      reset({
        companyName: profile.companyName || "",
        displayName: profile.displayName || "",
        emailFrom: profile.emailFrom || "",
        address: profile.address || "",
        taxId: profile.taxId || "",
        defaultCurrency: profile.defaultCurrency || "USD",
      });
    }
  }, [profile, reset]);

  const currency = useWatch({ control, name: "defaultCurrency" });

  const onSubmit = (data: SenderProfileFormInput) => {
    setError(null);
    updateProfileMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Settings saved successfully!");
        setError(null);
      },
      onError: (err) => {
        const message = err instanceof ApiError ? err.message : "Failed to update profile";
        setError(message);
        toast.error(message);
      },
    });
  };

  return (
    <>
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
          Company Information
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 3,
            mb: 4,
          }}
        >
          <TextField
            {...register("companyName")}
            label="Company Name"
            fullWidth
            error={!!errors.companyName}
            helperText={errors.companyName?.message || "Your business or company name"}
          />
          <TextField
            {...register("displayName")}
            label="Display Name"
            fullWidth
            error={!!errors.displayName}
            helperText={errors.displayName?.message || "Your personal name (if not using company)"}
          />
        </Box>

        <Divider sx={{ my: 4 }} />

        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
          Contact & Address
        </Typography>
        <Box sx={{ display: "grid", gap: 3, mb: 4 }}>
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
        </Box>

        <Divider sx={{ my: 4 }} />

        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
          Invoice Defaults
        </Typography>
        <Box sx={{ maxWidth: 300 }}>
          <FormControl fullWidth error={!!errors.defaultCurrency}>
            <InputLabel id="currency-label">Default Currency</InputLabel>
            <Select
              {...register("defaultCurrency")}
              labelId="currency-label"
              label="Default Currency"
              value={currency || "USD"}
            >
              {CURRENCIES.map((c) => (
                <MenuItem key={c.value} value={c.value}>
                  {c.label}
                </MenuItem>
              ))}
            </Select>
            {errors.defaultCurrency && (
              <FormHelperText>{errors.defaultCurrency.message}</FormHelperText>
            )}
          </FormControl>
        </Box>

        <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
          <Button
            type="submit"
            variant="contained"
            disabled={!isDirty || updateProfileMutation.isPending}
            sx={{ minWidth: 150 }}
          >
            {updateProfileMutation.isPending ? <Spinner size={20} /> : "Save Changes"}
          </Button>
        </Box>
      </Box>
    </>
  );
}
