import { NextResponse } from "next/server";

import { getAnalytics } from "@app/server/analytics";
import { withAuth } from "@app/server/api/route-helpers";

export const maxDuration = 30;

export const GET = withAuth(async (user) => {
  const analytics = await getAnalytics(user.id);

  return NextResponse.json(analytics);
});
