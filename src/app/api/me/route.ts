import { NextResponse } from "next/server";
import { getUserProfile } from "@app/server/user";
import { withAuth, notFoundResponse } from "@app/shared/api/route-helpers";

export const GET = withAuth(async (user) => {
  const profile = await getUserProfile(user.id);

  if (!profile) {
    return notFoundResponse("User");
  }

  return NextResponse.json(profile);
});
