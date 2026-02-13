import { NextResponse } from "next/server";

import { internalErrorResponse, parseBody } from "@app/shared/api/route-helpers";
import { waitlistSchema } from "@app/shared/schemas";

import { sendWaitlistConfirmationEmail, sendWaitlistNotificationEmail } from "@app/server/email";
import { addToWaitlist } from "@app/server/waitlist";

export async function POST(request: Request) {
  try {
    const { data, error } = await parseBody(request, waitlistSchema);

    if (error) {
      return error;
    }

    await addToWaitlist(data.email);

    await Promise.allSettled([
      sendWaitlistConfirmationEmail(data.email),
      sendWaitlistNotificationEmail(data.email),
    ]);

    return NextResponse.json({ message: "You've been added to the waitlist!" }, { status: 201 });
  } catch (err) {
    console.error("Waitlist error:", err);

    return internalErrorResponse();
  }
}
