"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  alpha,
  useTheme,
  Divider,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import PaymentIcon from "@mui/icons-material/Payment";
import NotificationsIcon from "@mui/icons-material/Notifications";
import BrushIcon from "@mui/icons-material/Brush";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { AppLayout } from "@app/components/layout/AppLayout";
import { Breadcrumbs } from "@app/components/navigation/Breadcrumbs";
import { PageLoader, Spinner } from "@app/components/feedback/Loading";
import { useToast } from "@app/components/feedback/Toast";
import { senderProfileFormSchema, SenderProfileFormInput } from "@app/shared/schemas";
import {
  useSenderProfile,
  useUpdateSenderProfile,
  useReminderSettings,
  useUpdateReminderSettings,
  ApiError,
} from "@app/lib/api";

const currencies = [
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "CAD", label: "CAD - Canadian Dollar" },
  { value: "AUD", label: "AUD - Australian Dollar" },
  { value: "JPY", label: "JPY - Japanese Yen" },
  { value: "CHF", label: "CHF - Swiss Franc" },
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <Box role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </Box>
  );
}

export default function SettingsPage() {
  const theme = useTheme();
  const toast = useToast();
  const [tabValue, setTabValue] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);

  // Reminder settings state
  const [reminderEnabled, setReminderEnabled] = React.useState(false);
  const [reminderMode, setReminderMode] = React.useState<"AFTER_SENT" | "AFTER_DUE">("AFTER_DUE");
  const [reminderDays, setReminderDays] = React.useState<number[]>([1, 3, 7]);
  const [newDayInput, setNewDayInput] = React.useState("");
  const [reminderDirty, setReminderDirty] = React.useState(false);

  // Branding state
  const [logoUrl, setLogoUrl] = React.useState("");
  const [primaryColor, setPrimaryColor] = React.useState("#1976d2");
  const [accentColor, setAccentColor] = React.useState("#9c27b0");
  const [brandingDirty, setBrandingDirty] = React.useState(false);

  const { data: profile, isLoading } = useSenderProfile();
  const { data: reminderSettings, isLoading: reminderLoading } = useReminderSettings();
  const updateReminderMutation = useUpdateReminderSettings();

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

  // Sync reminder settings
  React.useEffect(() => {
    if (reminderSettings) {
      setReminderEnabled(reminderSettings.enabled);
      setReminderMode(reminderSettings.mode);
      setReminderDays(reminderSettings.delaysDays as number[]);
      setReminderDirty(false);
    }
  }, [reminderSettings]);

  // Sync branding settings
  React.useEffect(() => {
    if (profile) {
      setLogoUrl(profile.logoUrl || "");
      setPrimaryColor(profile.primaryColor || "#1976d2");
      setAccentColor(profile.accentColor || "#9c27b0");
      setBrandingDirty(false);
    }
  }, [profile]);

  const updateProfileMutation = useUpdateSenderProfile();

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

  const currency = useWatch({ control, name: "defaultCurrency" });

  const handleAddReminderDay = () => {
    const day = parseInt(newDayInput, 10);
    if (!isNaN(day) && day >= 1 && day <= 90 && !reminderDays.includes(day)) {
      setReminderDays([...reminderDays, day].sort((a, b) => a - b));
      setNewDayInput("");
      setReminderDirty(true);
    }
  };

  const handleRemoveReminderDay = (day: number) => {
    if (reminderDays.length > 1) {
      setReminderDays(reminderDays.filter((d) => d !== day));
      setReminderDirty(true);
    }
  };

  const handleSaveReminderSettings = () => {
    updateReminderMutation.mutate(
      {
        enabled: reminderEnabled,
        mode: reminderMode,
        delaysDays: reminderDays,
      },
      {
        onSuccess: () => {
          toast.success("Reminder settings saved!");
          setReminderDirty(false);
        },
        onError: (err) => {
          toast.error(err instanceof ApiError ? err.message : "Failed to save reminder settings");
        },
      }
    );
  };

  const handleSaveBranding = () => {
    updateProfileMutation.mutate(
      {
        companyName: profile?.companyName || undefined,
        displayName: profile?.displayName || undefined,
        emailFrom: profile?.emailFrom || undefined,
        address: profile?.address || undefined,
        taxId: profile?.taxId || undefined,
        defaultCurrency: profile?.defaultCurrency || "USD",
        logoUrl: logoUrl || undefined,
        primaryColor: primaryColor || undefined,
        accentColor: accentColor || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Branding saved successfully!");
          setBrandingDirty(false);
        },
        onError: (err) => {
          toast.error(err instanceof ApiError ? err.message : "Failed to save branding");
        },
      }
    );
  };

  if (isLoading || reminderLoading) {
    return (
      <AppLayout>
        <PageLoader message="Loading settings..." />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Breadcrumbs items={[{ label: "Settings" }]} />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight={700}>
          Settings
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Manage your account and business settings
        </Typography>
      </Box>

      <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: alpha(theme.palette.primary.main, 0.02),
          }}
        >
          <Tab
            icon={<BusinessIcon />}
            iconPosition="start"
            label="Business Profile"
            sx={{ minHeight: 64 }}
          />
          <Tab
            icon={<PaymentIcon />}
            iconPosition="start"
            label="Payments"
            sx={{ minHeight: 64 }}
          />
          <Tab
            icon={<NotificationsIcon />}
            iconPosition="start"
            label="Reminders"
            sx={{ minHeight: 64 }}
          />
          <Tab icon={<BrushIcon />} iconPosition="start" label="Branding" sx={{ minHeight: 64 }} />
        </Tabs>

        <Box sx={{ p: 4 }}>
          <TabPanel value={tabValue} index={0}>
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
                  helperText={
                    errors.displayName?.message || "Your personal name (if not using company)"
                  }
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
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 3,
                }}
              >
                <PaymentIcon sx={{ fontSize: 40, color: "primary.main" }} />
              </Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {profile?.stripeAccountId ? "Stripe Connected" : "Connect Stripe"}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 3, maxWidth: 400, mx: "auto" }}
              >
                {profile?.stripeAccountId
                  ? "Your Stripe account is connected. You can accept online payments from your clients."
                  : "Connect your Stripe account to accept online payments directly from invoices."}
              </Typography>
              {profile?.stripeAccountId ? (
                <Alert severity="success" sx={{ maxWidth: 400, mx: "auto", borderRadius: 2 }}>
                  Stripe account connected successfully
                </Alert>
              ) : (
                <Button variant="contained" startIcon={<PaymentIcon />} size="large">
                  Connect Stripe Account
                </Button>
              )}
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 3 }}>
              Automatic Payment Reminders
            </Typography>

            <Box sx={{ mb: 4 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={reminderEnabled}
                    onChange={(e) => {
                      setReminderEnabled(e.target.checked);
                      setReminderDirty(true);
                    }}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography fontWeight={500}>Enable automatic reminders</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Automatically send payment reminders for unpaid invoices
                    </Typography>
                  </Box>
                }
                sx={{ alignItems: "flex-start", ml: 0 }}
              />
            </Box>

            {reminderEnabled && (
              <>
                <Divider sx={{ my: 3 }} />

                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                  When to send reminders
                </Typography>
                <FormControl sx={{ minWidth: 300, mb: 4 }}>
                  <InputLabel>Reminder timing</InputLabel>
                  <Select
                    value={reminderMode}
                    label="Reminder timing"
                    onChange={(e) => {
                      setReminderMode(e.target.value as "AFTER_SENT" | "AFTER_DUE");
                      setReminderDirty(true);
                    }}
                  >
                    <MenuItem value="AFTER_SENT">After invoice is sent</MenuItem>
                    <MenuItem value="AFTER_DUE">After due date passes</MenuItem>
                  </Select>
                  <FormHelperText>
                    {reminderMode === "AFTER_SENT"
                      ? "Reminders will be sent X days after the invoice is sent"
                      : "Reminders will be sent X days after the due date"}
                  </FormHelperText>
                </FormControl>

                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                  Reminder schedule (days)
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Reminders will be sent on these days{" "}
                  {reminderMode === "AFTER_SENT" ? "after sending" : "after the due date"}
                </Typography>

                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                  {reminderDays.map((day) => (
                    <Chip
                      key={day}
                      label={`Day ${day}`}
                      onDelete={
                        reminderDays.length > 1 ? () => handleRemoveReminderDay(day) : undefined
                      }
                      deleteIcon={<CloseIcon />}
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        "& .MuiChip-deleteIcon": {
                          color: "text.secondary",
                          "&:hover": { color: "error.main" },
                        },
                      }}
                    />
                  ))}
                </Box>

                <Box sx={{ display: "flex", gap: 1, alignItems: "center", maxWidth: 200 }}>
                  <TextField
                    size="small"
                    type="number"
                    placeholder="Add day"
                    value={newDayInput}
                    onChange={(e) => setNewDayInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddReminderDay();
                      }
                    }}
                    slotProps={{
                      htmlInput: { min: 1, max: 90 },
                    }}
                    sx={{ width: 100 }}
                  />
                  <Tooltip title="Add reminder day">
                    <IconButton
                      onClick={handleAddReminderDay}
                      color="primary"
                      size="small"
                      disabled={reminderDays.length >= 5}
                    >
                      <AddIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: "block" }}
                >
                  Maximum 5 reminder days (1-90 days)
                </Typography>
              </>
            )}

            <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                onClick={handleSaveReminderSettings}
                disabled={!reminderDirty || updateReminderMutation.isPending}
                sx={{ minWidth: 150 }}
              >
                {updateReminderMutation.isPending ? <Spinner size={20} /> : "Save Changes"}
              </Button>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 3 }}>
              Invoice Branding
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Customize how your invoices look to clients. These settings will be applied to all
              public invoice views.
            </Typography>

            <Box sx={{ display: "grid", gap: 4, maxWidth: 500 }}>
              <TextField
                label="Logo URL"
                value={logoUrl}
                onChange={(e) => {
                  setLogoUrl(e.target.value);
                  setBrandingDirty(true);
                }}
                fullWidth
                placeholder="https://example.com/logo.png"
                helperText="Enter a URL to your company logo (recommended: 200x60px)"
              />

              {logoUrl && (
                <Box
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.background.default, 0.5),
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mb: 1, display: "block" }}
                  >
                    Logo Preview
                  </Typography>
                  <Box
                    component="img"
                    src={logoUrl}
                    alt="Logo preview"
                    sx={{
                      maxWidth: 200,
                      maxHeight: 60,
                      objectFit: "contain",
                    }}
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </Box>
              )}

              <Divider />

              <Box>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                  Brand Colors
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Primary Color
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                      <Box
                        component="input"
                        type="color"
                        value={primaryColor}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setPrimaryColor(e.target.value);
                          setBrandingDirty(true);
                        }}
                        sx={{
                          width: 48,
                          height: 48,
                          border: 1,
                          borderColor: "divider",
                          borderRadius: 1,
                          cursor: "pointer",
                          p: 0.5,
                        }}
                      />
                      <TextField
                        size="small"
                        value={primaryColor}
                        onChange={(e) => {
                          setPrimaryColor(e.target.value);
                          setBrandingDirty(true);
                        }}
                        sx={{ width: 120 }}
                        slotProps={{
                          htmlInput: { pattern: "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$" },
                        }}
                      />
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Accent Color
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                      <Box
                        component="input"
                        type="color"
                        value={accentColor}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setAccentColor(e.target.value);
                          setBrandingDirty(true);
                        }}
                        sx={{
                          width: 48,
                          height: 48,
                          border: 1,
                          borderColor: "divider",
                          borderRadius: 1,
                          cursor: "pointer",
                          p: 0.5,
                        }}
                      />
                      <TextField
                        size="small"
                        value={accentColor}
                        onChange={(e) => {
                          setAccentColor(e.target.value);
                          setBrandingDirty(true);
                        }}
                        sx={{ width: 120 }}
                        slotProps={{
                          htmlInput: { pattern: "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$" },
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                  Preview
                </Typography>
                <Box
                  sx={{
                    p: 3,
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 2,
                    bgcolor: "background.paper",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                    {logoUrl ? (
                      <Box
                        component="img"
                        src={logoUrl}
                        alt="Logo"
                        sx={{ maxWidth: 120, maxHeight: 40, objectFit: "contain" }}
                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <Typography variant="h6" fontWeight={700} sx={{ color: primaryColor }}>
                        {profile?.companyName || profile?.displayName || "Your Company"}
                      </Typography>
                    )}
                  </Box>
                  <Typography variant="h5" fontWeight={700} sx={{ color: primaryColor, mb: 1 }}>
                    Invoice #INV-001
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                    <Button
                      size="small"
                      variant="contained"
                      sx={{ bgcolor: primaryColor, "&:hover": { bgcolor: primaryColor } }}
                    >
                      Pay Now
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{
                        color: accentColor,
                        borderColor: accentColor,
                        "&:hover": { borderColor: accentColor },
                      }}
                    >
                      Download
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Box>

            <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                onClick={handleSaveBranding}
                disabled={!brandingDirty || updateProfileMutation.isPending}
                sx={{ minWidth: 150 }}
              >
                {updateProfileMutation.isPending ? <Spinner size={20} /> : "Save Changes"}
              </Button>
            </Box>
          </TabPanel>
        </Box>
      </Paper>
    </AppLayout>
  );
}
