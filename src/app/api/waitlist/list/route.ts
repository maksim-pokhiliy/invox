import { NextResponse } from "next/server";

import { withAdmin } from "@app/shared/api/route-helpers";

import { listWaitlistEntries } from "@app/server/waitlist";

export const GET = withAdmin(async () => {
  const entries = await listWaitlistEntries();

  return NextResponse.json(entries);
});
