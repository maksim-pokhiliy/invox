import { z } from "zod";
import { REMINDER } from "@app/shared/config/config";

export const updateReminderSettingsSchema = z.object({
  enabled: z.boolean(),
  mode: z.enum(["AFTER_SENT", "AFTER_DUE"]),
  delaysDays: z
    .array(z.number().min(REMINDER.MIN_DAYS).max(REMINDER.MAX_DAYS))
    .min(1)
    .max(REMINDER.MAX_REMINDER_COUNT),
});

export type UpdateReminderSettingsInput = z.infer<typeof updateReminderSettingsSchema>;
