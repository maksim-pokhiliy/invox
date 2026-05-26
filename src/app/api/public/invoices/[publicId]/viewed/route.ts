import { NextResponse } from "next/server";

import { asPublicId } from "@app/shared/types/ids";

import { applyRateLimit, RATE_LIMITS } from "@app/server/api/rate-limit";
import { notFoundResponse, withPublic } from "@app/server/api/route-helpers";
import { getUser } from "@app/server/auth/require-user";
import { tryMarkViewed } from "@app/server/invoices";

export const POST = withPublic(async (request, context) => {
  const user = await getUser();
  const viewerUserId = user?.id ?? null;
  const { response: limited } = await applyRateLimit(request, {
    bucket: "public.invoice.viewed",
    ...RATE_LIMITS.PUBLIC_VIEW,
    ...(viewerUserId ? { identifier: `user:${viewerUserId}` } : {}),
  });

  if (limited) {
    return limited;
  }

  const { publicId } = await context.params;
  const result = await tryMarkViewed(asPublicId(publicId), viewerUserId);

  if (!result.found) {
    return notFoundResponse("Invoice");
  }

  return NextResponse.json({ success: true });
});
