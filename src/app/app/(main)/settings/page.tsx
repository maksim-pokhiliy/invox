"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import BrushIcon from "@mui/icons-material/Brush";
import BusinessIcon from "@mui/icons-material/Business";
import ExtensionIcon from "@mui/icons-material/Extension";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PaymentIcon from "@mui/icons-material/Payment";
import { alpha, Box, Divider, Paper, Stack, Tab, Tabs, Typography, useTheme } from "@mui/material";

import { env } from "@app/shared/config/env";
import { AppLayout } from "@app/shared/layout/app-layout";
import { Breadcrumbs } from "@app/shared/ui/breadcrumbs";
import { CardSkeleton } from "@app/shared/ui/skeletons";

import {
  ConnectBankButton,
  ConnectionList,
  PendingMatches,
} from "@app/features/banking/components";
import { useReminderSettings, useSenderProfile } from "@app/features/settings";
import {
  BrandingTab,
  BusinessProfileTab,
  PaymentsTab,
  RemindersTab,
} from "@app/features/settings/components";
import { IntegrationsTab } from "@app/features/time-tracking/components";

const BANKING_ENABLED = env.NEXT_PUBLIC_BANKING_ENABLED;

interface TabDef {
  key: string;
  label: string;
  icon: React.ReactElement;
}

const ALL_TABS: TabDef[] = [
  { key: "profile", label: "Business Profile", icon: <BusinessIcon /> },
  { key: "integrations", label: "Integrations", icon: <ExtensionIcon /> },
  ...(BANKING_ENABLED ? [{ key: "payments", label: "Payments", icon: <PaymentIcon /> }] : []),
  { key: "reminders", label: "Reminders", icon: <NotificationsIcon /> },
  { key: "branding", label: "Branding", icon: <BrushIcon /> },
];

const TAB_MAP = Object.fromEntries(ALL_TABS.map((t, i) => [t.key, i]));

interface TabPanelProps {
  children?: React.ReactNode;
  tabKey: string;
  activeKey: string;
}

function TabPanel({ children, tabKey, activeKey, ...other }: TabPanelProps) {
  const isActive = tabKey === activeKey;

  return (
    <Box role="tabpanel" hidden={!isActive} {...other}>
      {isActive && <Box sx={{ pt: 3 }}>{children}</Box>}
    </Box>
  );
}

export default function SettingsPage() {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tabParam = searchParams.get("tab");
  const tabValue = tabParam ? (TAB_MAP[tabParam] ?? 0) : 0;
  const activeKey = ALL_TABS[tabValue]?.key ?? "profile";

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    const key = ALL_TABS[newValue]?.key;

    if (key) {
      const params = new URLSearchParams(searchParams.toString());

      params.set("tab", key);
      router.replace(`${pathname}?${params.toString()}`);
    }
  };

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
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: alpha(theme.palette.primary.main, 0.02),
          }}
        >
          {ALL_TABS.map((tab) => (
            <Tab
              key={tab.key}
              icon={tab.icon}
              iconPosition="start"
              label={tab.label}
              sx={{ minHeight: 64 }}
            />
          ))}
        </Tabs>

        <Box sx={{ p: 4 }}>
          {contentLoading ? (
            <CardSkeleton />
          ) : (
            <>
              <TabPanel tabKey="profile" activeKey={activeKey}>
                <BusinessProfileTab profile={profile} />
              </TabPanel>

              <TabPanel tabKey="integrations" activeKey={activeKey}>
                <IntegrationsTab />
              </TabPanel>

              {BANKING_ENABLED && (
                <TabPanel tabKey="payments" activeKey={activeKey}>
                  <PaymentsTab>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="flex-end"
                      sx={{ mb: 2 }}
                    >
                      <ConnectBankButton />
                    </Stack>

                    <ConnectionList />

                    <Divider sx={{ my: 4 }} />

                    <PendingMatches />
                  </PaymentsTab>
                </TabPanel>
              )}

              <TabPanel tabKey="reminders" activeKey={activeKey}>
                <RemindersTab settings={reminderSettings} />
              </TabPanel>

              <TabPanel tabKey="branding" activeKey={activeKey}>
                <BrandingTab profile={profile} />
              </TabPanel>
            </>
          )}
        </Box>
      </Paper>
    </AppLayout>
  );
}
