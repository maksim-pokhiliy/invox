"use client";

import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";

import { REMINDER_MODE, type ReminderModeValue } from "@app/shared/config/config";

type ReminderMode = ReminderModeValue;

interface ReminderModeSelectorProps {
  mode: ReminderMode;
  onChange: (mode: ReminderMode) => void;
}

const MODE_DESCRIPTIONS: Record<ReminderMode, string> = {
  [REMINDER_MODE.AFTER_SENT]: "Reminders will be sent X days after the invoice is sent",
  [REMINDER_MODE.AFTER_DUE]: "Reminders will be sent X days after the due date",
};

export function ReminderModeSelector({ mode, onChange }: ReminderModeSelectorProps) {
  return (
    <>
      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
        When to send reminders
      </Typography>
      <FormControl sx={{ minWidth: 300, mb: 4 }}>
        <InputLabel>Reminder timing</InputLabel>
        <Select
          value={mode}
          label="Reminder timing"
          onChange={(e) => onChange(e.target.value as ReminderMode)}
        >
          <MenuItem value={REMINDER_MODE.AFTER_SENT}>After invoice is sent</MenuItem>
          <MenuItem value={REMINDER_MODE.AFTER_DUE}>After due date passes</MenuItem>
        </Select>
        <FormHelperText>{MODE_DESCRIPTIONS[mode]}</FormHelperText>
      </FormControl>
    </>
  );
}
