"use client";

import * as React from "react";

import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import {
  alpha,
  Chip,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";

import { REMINDER, UI } from "@app/shared/config/config";

interface ReminderDaysEditorProps {
  days: number[];
  onDaysChange: (days: number[]) => void;
  daysDescription: string;
}

export function ReminderDaysEditor({
  days,
  onDaysChange,
  daysDescription,
}: ReminderDaysEditorProps) {
  const theme = useTheme();
  const [newDayInput, setNewDayInput] = React.useState("");

  const handleAddDay = () => {
    const day = parseInt(newDayInput, 10);

    if (
      !isNaN(day) &&
      day >= REMINDER.MIN_DAYS &&
      day <= REMINDER.MAX_DAYS &&
      !days.includes(day)
    ) {
      onDaysChange([...days, day].sort((a, b) => a - b));
      setNewDayInput("");
    }
  };

  const handleRemoveDay = (day: number) => {
    if (days.length > 1) {
      onDaysChange(days.filter((d) => d !== day));
    }
  };

  return (
    <>
      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
        Reminder schedule (days)
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Reminders will be sent on these days {daysDescription}
      </Typography>

      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", mb: 2 }}>
        {days.map((day) => (
          <Chip
            key={day}
            label={`Day ${day}`}
            onDelete={days.length > 1 ? () => handleRemoveDay(day) : undefined}
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
      </Stack>

      <Stack direction="row" spacing={1} sx={{ alignItems: "center", maxWidth: 200 }}>
        <TextField
          size="small"
          type="number"
          placeholder="Add day"
          value={newDayInput}
          onChange={(e) => setNewDayInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddDay();
            }
          }}
          slotProps={{ htmlInput: { min: REMINDER.MIN_DAYS, max: REMINDER.MAX_DAYS } }}
          sx={{ width: UI.FIELD_WIDTH_REMINDER }}
        />
        <Tooltip title="Add reminder day">
          <IconButton
            onClick={handleAddDay}
            color="primary"
            size="small"
            disabled={days.length >= REMINDER.MAX_REMINDER_COUNT}
          >
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Stack>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
        Maximum {REMINDER.MAX_REMINDER_COUNT} reminder days ({REMINDER.MIN_DAYS}-{REMINDER.MAX_DAYS}{" "}
        days)
      </Typography>
    </>
  );
}
