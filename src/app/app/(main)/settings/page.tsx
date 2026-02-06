"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Box, Paper, Typography, Tabs, Tab, alpha, useTheme } from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import PaymentIcon from "@mui/icons-material/Payment";
import NotificationsIcon from "@mui/icons-material/Notifications";
import BrushIcon from "@mui/icons-material/Brush";
import { AppLayout } from "@app/shared/layout/app-layout";
import { Breadcrumbs } from "@app/shared/ui/breadcrumbs";
import { CardSkeleton } from "@app/shared/ui/loading";
import { useSenderProfile, useReminderSettings } from "@app/features/settings";
import {
  BusinessProfileTab,
  PaymentsTab,
  RemindersTab,
  BrandingTab,
} from "@app/features/settings/components";

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
  const searchParams = useSearchParams();

  const tabParam = searchParams.get("tab");
  const initialTab = tabParam ? (TAB_MAP[tabParam] ?? 0) : 0;
  const [tabValue, setTabValue] = React.useState(initialTab);

  const { data: profile, isLoading } = useSenderProfile();
  const { data: reminderSettings, isLoading: reminderLoading } = useReminderSettings();

  const contentLoading = isLoading || reminderLoading;

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
          {contentLoading ? (
            <CardSkeleton />
          ) : (
            <>
              <TabPanel value={tabValue} index={0}>
                <BusinessProfileTab profile={profile} />
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <PaymentsTab />
              </TabPanel>

              <TabPanel value={tabValue} index={2}>
                <RemindersTab settings={reminderSettings} />
              </TabPanel>

              <TabPanel value={tabValue} index={3}>
                <BrandingTab profile={profile} />
              </TabPanel>
            </>
          )}
        </Box>
      </Paper>
    </AppLayout>
  );
}
