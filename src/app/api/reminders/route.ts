import { NextResponse } from "next/server";
import { getFollowUpRule, createOrUpdateFollowUpRule } from "@app/server/followups";
import { REMINDER } from "@app/shared/config/config";
import { withAuth, parseBody } from "@app/shared/api/route-helpers";
import { updateReminderSettingsSchema } from "@app/shared/schemas";

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
