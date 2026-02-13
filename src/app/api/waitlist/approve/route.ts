import { NextResponse } from "next/server";

import { notFoundResponse, parseBody, withAuth } from "@app/shared/api/route-helpers";
import { waitlistSchema } from "@app/shared/schemas";

import { sendWaitlistApprovalEmail } from "@app/server/email";
import { approveWaitlistEntry } from "@app/server/waitlist";

export const POST = withAuth(async (_user, request) => {
  const { data, error } = await parseBody(request, waitlistSchema);

  if (error) {
    return error;
  }

  try {
    await approveWaitlistEntry(data.email);
  } catch {
    return notFoundResponse("Waitlist entry");
  }

  await sendWaitlistApprovalEmail(data.email);

  return NextResponse.json({ message: "User approved and notified" });
});
