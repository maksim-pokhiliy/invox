import { NextResponse } from "next/server";
import { getAnalytics } from "@app/server/analytics";
import { withAuth } from "@app/shared/api/route-helpers";

export const GET = withAuth(async (user) => {
  const analytics = await getAnalytics(user.id);
  return NextResponse.json(analytics);
});
