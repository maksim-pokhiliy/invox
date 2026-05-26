import { NextResponse } from "next/server";

import { notFoundResponse, withAuth } from "@app/server/api/route-helpers";
import { disconnectProvider } from "@app/server/time-tracking";

export const DELETE = withAuth(async (user, _request, context) => {
  const { id } = await context.params;
  const result = await disconnectProvider(user.id, id);

  if (!result) {
    return notFoundResponse("Connection");
  }

  return NextResponse.json(result);
});
