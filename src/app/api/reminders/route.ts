import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, AuthenticationError } from "@app/server/auth/require-user";
import { getFollowUpRule, createOrUpdateFollowUpRule } from "@app/server/followups";
import { REMINDER } from "@app/lib/constants";

const updateReminderSettingsSchema = z.object({
  enabled: z.boolean(),
  mode: z.enum(["AFTER_SENT", "AFTER_DUE"]),
  delaysDays: z
    .array(z.number().min(REMINDER.MIN_DAYS).max(REMINDER.MAX_DAYS))
    .min(1)
    .max(REMINDER.MAX_REMINDER_COUNT),
});

export async function GET() {
  try {
    const user = await requireUser();
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
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 }
      );
    }
    console.error("Get reminder settings error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const parsed = updateReminderSettingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.issues[0]?.message ?? "Invalid input",
          },
        },
        { status: 400 }
      );
    }

    const rule = await createOrUpdateFollowUpRule(user.id, parsed.data);

    return NextResponse.json({
      enabled: rule.enabled,
      mode: rule.mode,
      delaysDays: rule.delaysDays,
    });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 }
      );
    }
    console.error("Update reminder settings error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
