"use client";

import * as React from "react";
import { Box, Typography } from "@mui/material";
import { LoadingButton } from "@app/shared/ui/loading-button";
import { useToast } from "@app/shared/ui/toast";
import { useUpdateReminderSettings, type ReminderSettings } from "@app/features/settings";
import { ApiError } from "@app/shared/api";
import { ReminderToggle } from "./reminder-toggle";
import { ReminderSchedule } from "./reminder-schedule";

interface RemindersTabProps {
  settings: ReminderSettings | undefined;
}

export function RemindersTab({ settings }: RemindersTabProps) {
  const toast = useToast();
  const updateReminderMutation = useUpdateReminderSettings();

  const [enabled, setEnabled] = React.useState(false);
  const [mode, setMode] = React.useState<"AFTER_SENT" | "AFTER_DUE">("AFTER_DUE");
  const [days, setDays] = React.useState<number[]>([1, 3, 7]);
  const [isDirty, setIsDirty] = React.useState(false);

  React.useEffect(() => {
    if (settings) {
      setEnabled(settings.enabled);
      setMode(settings.mode);
      setDays(settings.delaysDays as number[]);
      setIsDirty(false);
    }
  }, [settings]);

  const handleEnabledChange = (value: boolean) => {
    setEnabled(value);
    setIsDirty(true);
  };

  const handleModeChange = (value: "AFTER_SENT" | "AFTER_DUE") => {
    setMode(value);
    setIsDirty(true);
  };

  const handleDaysChange = (value: number[]) => {
    setDays(value);
    setIsDirty(true);
  };

  const handleSave = () => {
    updateReminderMutation.mutate(
      { enabled, mode, delaysDays: days },
      {
        onSuccess: () => {
          toast.success("Reminder settings saved!");
          setIsDirty(false);
        },
        onError: (err) => {
          toast.error(err instanceof ApiError ? err.message : "Failed to save reminder settings");
        },
      }
    );
  };

  return (
    <>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 3 }}>
        Automatic Payment Reminders
      </Typography>

      <ReminderToggle enabled={enabled} onChange={handleEnabledChange} />

      {enabled && (
        <ReminderSchedule
          mode={mode}
          onModeChange={handleModeChange}
          days={days}
          onDaysChange={handleDaysChange}
        />
      )}

      <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
        <LoadingButton
          variant="contained"
          onClick={handleSave}
          disabled={!isDirty}
          loading={updateReminderMutation.isPending}
        >
          Save Changes
        </LoadingButton>
      </Box>
    </>
  );
}
