import { NextResponse } from "next/server";

import { notFoundResponse, withAuth } from "@app/server/api/route-helpers";
import { getUserProfile } from "@app/server/user";

export const GET = withAuth(async (user) => {
  const profile = await getUserProfile(user.id);

  if (!profile) {
    return notFoundResponse("User");
  }

  return NextResponse.json(profile);
});
