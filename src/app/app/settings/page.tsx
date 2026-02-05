"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Box, Paper, Typography, Tabs, Tab, alpha, useTheme } from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import PaymentIcon from "@mui/icons-material/Payment";
import NotificationsIcon from "@mui/icons-material/Notifications";
import BrushIcon from "@mui/icons-material/Brush";
import { AppLayout } from "@app/components/layout/AppLayout";
import { Breadcrumbs } from "@app/components/navigation/Breadcrumbs";
import { PageLoader } from "@app/components/feedback/Loading";
import { useToast } from "@app/components/feedback/Toast";
import { useSenderProfile, useReminderSettings } from "@app/lib/api";
import { BusinessProfileTab, PaymentsTab, RemindersTab, BrandingTab } from "./components";

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

const TAB_MAP: Record<string, number> = {
  profile: 0,
  payments: 1,
  reminders: 2,
  branding: 3,
};

export default function SettingsPage() {
  const theme = useTheme();
  const toast = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get tab from URL or default to 0
  const tabParam = searchParams.get("tab");
  const initialTab = tabParam ? (TAB_MAP[tabParam] ?? 0) : 0;
  const [tabValue, setTabValue] = React.useState(initialTab);

  // Handle URL params for success/error messages
  React.useEffect(() => {
    const success = searchParams.get("success");
    const errorParam = searchParams.get("error");

    if (success === "stripe_connected") {
      toast.success("Stripe account connected successfully!");
      router.replace("/app/settings?tab=payments");
    } else if (errorParam) {
      const errorMessages: Record<string, string> = {
        stripe_connect_failed: "Failed to connect Stripe account",
        missing_params: "Missing required parameters",
        state_expired: "Connection expired, please try again",
        invalid_state: "Invalid connection state",
        connection_failed: "Failed to connect Stripe account",
        access_denied: "Access was denied by Stripe",
      };
      toast.error(errorMessages[errorParam] || "An error occurred");
      router.replace("/app/settings?tab=payments");
    }
  }, [searchParams, toast, router]);

  const { data: profile, isLoading } = useSenderProfile();
  const { data: reminderSettings, isLoading: reminderLoading } = useReminderSettings();

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
            <BusinessProfileTab profile={profile} />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <PaymentsTab isConnected={!!profile?.stripeAccountId} />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <RemindersTab settings={reminderSettings} />
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <BrandingTab profile={profile} />
          </TabPanel>
        </Box>
      </Paper>
    </AppLayout>
  );
}
