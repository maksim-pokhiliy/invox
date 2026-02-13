"use client";

import { Divider } from "@mui/material";

import { REMINDER_MODE, type ReminderModeValue } from "@app/shared/config/config";

import { ReminderDaysEditor } from "./reminder-days-editor";
import { ReminderModeSelector } from "./reminder-mode-selector";

interface ReminderScheduleProps {
  mode: ReminderModeValue;
  onModeChange: (mode: ReminderModeValue) => void;
  days: number[];
  onDaysChange: (days: number[]) => void;
}

export function ReminderSchedule({
  mode,
  onModeChange,
  days,
  onDaysChange,
}: ReminderScheduleProps) {
  const daysDescription =
    mode === REMINDER_MODE.AFTER_SENT ? "after sending" : "after the due date";

  return (
    <>
      <Divider sx={{ my: 3 }} />
      <ReminderModeSelector mode={mode} onChange={onModeChange} />
      <ReminderDaysEditor
        days={days}
        onDaysChange={onDaysChange}
        daysDescription={daysDescription}
      />
    </>
  );
}
