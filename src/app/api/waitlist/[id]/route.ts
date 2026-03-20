import { NextResponse } from "next/server";

import { notFoundResponse, withAdmin } from "@app/shared/api/route-helpers";

import { deleteWaitlistEntry } from "@app/server/waitlist";

export const DELETE = withAdmin(async (_user, _request, context) => {
  const { id } = await context.params;

  const result = await deleteWaitlistEntry(id);

  if (!result) {
    return notFoundResponse("Waitlist entry");
  }

  return NextResponse.json({ success: true });
});
