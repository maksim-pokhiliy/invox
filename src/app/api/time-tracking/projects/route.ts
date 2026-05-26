import { NextResponse } from "next/server";

import { errorResponse, withAuth } from "@app/server/api/route-helpers";
import { createRequestBudget } from "@app/server/api/timeout";
import { getProjects } from "@app/server/time-tracking";
import { timeTrackingErrorHandlers } from "@app/server/time-tracking/api-errors";
import { TIME_TRACKING_REQUEST_BUDGET_MS } from "@app/server/time-tracking/budget";

export const maxDuration = 10;

export const GET = withAuth(async (user, request) => {
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get("provider");
  const workspaceId = searchParams.get("workspaceId");

  if (!provider || !workspaceId) {
    return errorResponse("VALIDATION_ERROR", "Provider and workspaceId are required", 400);
  }

  const budget = createRequestBudget(TIME_TRACKING_REQUEST_BUDGET_MS);

  try {
    const projects = await getProjects(user.id, provider, workspaceId, {
      signal: budget.signal,
    });

    return NextResponse.json(projects);
  } catch (error) {
    return budget.rethrowIfExceeded(error);
  } finally {
    budget.cancel();
  }
}, timeTrackingErrorHandlers);
