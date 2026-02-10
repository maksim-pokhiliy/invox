"use client";

import * as React from "react";
import { Box, Alert } from "@mui/material";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { senderProfileFormSchema, SenderProfileFormInput } from "@app/shared/schemas";
import { LoadingButton } from "@app/shared/ui/loading-button";
import { useToast } from "@app/shared/ui/toast";
import { useUpdateSenderProfile } from "@app/features/settings";
import { ApiError } from "@app/shared/api";
import type { SenderProfile } from "@app/shared/schemas/api";
import { CompanyInfoFields } from "./company-info-fields";
import { ContactFields } from "./contact-fields";
import { CurrencySelector } from "./currency-selector";

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
        defaultRate: profile.defaultRate ? profile.defaultRate / 100 : undefined,
      });
    }
  }, [profile, reset]);

  const currency = useWatch({ control, name: "defaultCurrency" });

  const onSubmit = (data: SenderProfileFormInput) => {
    setError(null);
    const payload = {
      ...data,
      defaultRate: data.defaultRate ? Math.round(data.defaultRate * 100) : undefined,
    };
    updateProfileMutation.mutate(payload, {
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

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <CompanyInfoFields register={register} errors={errors} />
        <ContactFields register={register} errors={errors} />
        <CurrencySelector register={register} errors={errors} currentValue={currency} />

        <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
          <LoadingButton
            type="submit"
            variant="contained"
            disabled={!isDirty}
            loading={updateProfileMutation.isPending}
          >
            Save Changes
          </LoadingButton>
        </Box>
      </Box>
    </>
  );
}
