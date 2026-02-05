"use client";

import * as React from "react";
import {
  Box,
  Button,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  Switch,
  FormControlLabel,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  Divider,
  alpha,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { Spinner } from "@app/components/feedback/Loading";
import { useToast } from "@app/components/feedback/Toast";
import { useUpdateReminderSettings, ApiError } from "@app/lib/api";
import type { ReminderSettings } from "@app/lib/api/client";

interface RemindersTabProps {
  settings: ReminderSettings | undefined;
}

export function RemindersTab({ settings }: RemindersTabProps) {
  const theme = useTheme();
  const toast = useToast();
  const updateReminderMutation = useUpdateReminderSettings();

  const [reminderEnabled, setReminderEnabled] = React.useState(false);
  const [reminderMode, setReminderMode] = React.useState<"AFTER_SENT" | "AFTER_DUE">("AFTER_DUE");
  const [reminderDays, setReminderDays] = React.useState<number[]>([1, 3, 7]);
  const [newDayInput, setNewDayInput] = React.useState("");
  const [reminderDirty, setReminderDirty] = React.useState(false);

  React.useEffect(() => {
    if (settings) {
      setReminderEnabled(settings.enabled);
      setReminderMode(settings.mode);
      setReminderDays(settings.delaysDays as number[]);
      setReminderDirty(false);
    }
  }, [settings]);

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

  return (
    <>
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
                onDelete={reminderDays.length > 1 ? () => handleRemoveReminderDay(day) : undefined}
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
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
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
    </>
  );
}
