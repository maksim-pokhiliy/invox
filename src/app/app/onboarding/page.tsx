"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import { Logo } from "@app/shared/ui/logo";
import { Spinner } from "@app/shared/ui/loading";
import { useToast } from "@app/shared/ui/toast";
import { senderProfileFormSchema, SenderProfileFormInput } from "@app/shared/schemas";

const currencies = [
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "CAD", label: "CAD - Canadian Dollar" },
  { value: "AUD", label: "AUD - Australian Dollar" },
  { value: "JPY", label: "JPY - Japanese Yen" },
  { value: "CHF", label: "CHF - Swiss Franc" },
];

const steps = ["Account Created", "Business Profile", "Ready to Invoice"];

export default function OnboardingPage() {
  const router = useRouter();
  const toast = useToast();
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SenderProfileFormInput>({
    resolver: zodResolver(senderProfileFormSchema),
    defaultValues: {
      defaultCurrency: "USD",
    },
  });

  const onSubmit = async (data: SenderProfileFormInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/sender-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error?.message || "Failed to save profile");
        return;
      }

      toast.success("Profile saved successfully!");
      router.push("/app/invoices");
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const currency = watch("defaultCurrency");

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Box sx={{ mb: 4 }}>
            <Logo size="large" />
          </Box>

          <Stepper activeStep={1} alternativeLabel sx={{ mb: 4, width: "100%" }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Paper sx={{ p: 4, borderRadius: 3, width: "100%" }}>
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                Set Up Your Business Profile
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This information will appear on your invoices
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <TextField
                {...register("companyName")}
                label="Company Name"
                fullWidth
                margin="normal"
                error={!!errors.companyName}
                helperText={
                  errors.companyName?.message ||
                  "Enter your company name or leave blank if using personal name"
                }
              />
              <TextField
                {...register("displayName")}
                label="Display Name (Personal)"
                fullWidth
                margin="normal"
                error={!!errors.displayName}
                helperText={
                  errors.displayName?.message || "Your personal name if not using a company"
                }
              />
              <TextField
                {...register("emailFrom")}
                label="Reply-to Email"
                type="email"
                fullWidth
                margin="normal"
                error={!!errors.emailFrom}
                helperText={errors.emailFrom?.message || "Email where clients can reply (optional)"}
              />
              <TextField
                {...register("address")}
                label="Business Address"
                fullWidth
                margin="normal"
                multiline
                rows={2}
                error={!!errors.address}
                helperText={errors.address?.message}
              />
              <TextField
                {...register("taxId")}
                label="Tax ID / VAT Number"
                fullWidth
                margin="normal"
                error={!!errors.taxId}
                helperText={errors.taxId?.message || "Optional"}
              />
              <FormControl fullWidth margin="normal" error={!!errors.defaultCurrency}>
                <InputLabel id="currency-label">Default Currency</InputLabel>
                <Select
                  {...register("defaultCurrency")}
                  labelId="currency-label"
                  label="Default Currency"
                  value={currency || "USD"}
                >
                  {currencies.map((c) => (
                    <MenuItem key={c.value} value={c.value}>
                      {c.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.defaultCurrency && (
                  <FormHelperText>{errors.defaultCurrency.message}</FormHelperText>
                )}
              </FormControl>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                sx={{ mt: 4, py: 1.5 }}
                disabled={isLoading}
              >
                {isLoading ? <Spinner size={24} /> : "Complete Setup"}
              </Button>
            </Box>
          </Paper>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 4 }}>
            &copy; {new Date().getFullYear()} Invox
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
