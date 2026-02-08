import { NextResponse } from "next/server";
import { z } from "zod";
import { getFollowUpRule, createOrUpdateFollowUpRule } from "@app/server/followups";
import { REMINDER } from "@app/shared/config/config";
import { withAuth, parseBody } from "@app/shared/api/route-helpers";

const updateReminderSettingsSchema = z.object({
  enabled: z.boolean(),
  mode: z.enum(["AFTER_SENT", "AFTER_DUE"]),
  delaysDays: z
    .array(z.number().min(REMINDER.MIN_DAYS).max(REMINDER.MAX_DAYS))
    .min(1)
    .max(REMINDER.MAX_REMINDER_COUNT),
});

export const GET = withAuth(async (user) => {
  const rule = await getFollowUpRule(user.id);

  if (!rule) {
    return NextResponse.json({
      enabled: false,
      mode: "AFTER_DUE",
      delaysDays: [...REMINDER.DEFAULT_DAYS],
    });
  }

  return NextResponse.json({
    enabled: rule.enabled,
    mode: rule.mode,
    delaysDays: rule.delaysDays,
  });
});

export const PUT = withAuth(async (user, request) => {
  const { data, error } = await parseBody(request, updateReminderSettingsSchema);

  if (error) {
    return error;
  }

  const rule = await createOrUpdateFollowUpRule(user.id, data);

  return NextResponse.json({
    enabled: rule.enabled,
    mode: rule.mode,
    delaysDays: rule.delaysDays,
  });
});
