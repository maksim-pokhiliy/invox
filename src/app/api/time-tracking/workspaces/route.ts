import { NextResponse } from "next/server";

import { errorResponse, withAuth } from "@app/server/api/route-helpers";
import { createRequestBudget } from "@app/server/api/timeout";
import { getWorkspaces } from "@app/server/time-tracking";
import { timeTrackingErrorHandlers } from "@app/server/time-tracking/api-errors";
import { TIME_TRACKING_REQUEST_BUDGET_MS } from "@app/server/time-tracking/budget";

export const maxDuration = 10;

export const GET = withAuth(async (user, request) => {
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get("provider");

  if (!provider) {
    return errorResponse("VALIDATION_ERROR", "Provider is required", 400);
  }

  const budget = createRequestBudget(TIME_TRACKING_REQUEST_BUDGET_MS);

  try {
    const workspaces = await getWorkspaces(user.id, provider, {
      signal: budget.signal,
    });

    return NextResponse.json(workspaces);
  } catch (error) {
    return budget.rethrowIfExceeded(error);
  } finally {
    budget.cancel();
  }
}, timeTrackingErrorHandlers);
