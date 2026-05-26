import { NextResponse } from "next/server";

import { z } from "zod";

import { errorResponse, parseBody, withAuth } from "@app/server/api/route-helpers";
import {
  connectProvider,
  getConnections,
  InvalidProviderTokenError,
} from "@app/server/time-tracking";
import { timeTrackingErrorHandlers } from "@app/server/time-tracking/api-errors";

export const maxDuration = 10;

const connectSchema = z.object({
  provider: z.string().min(1),
  token: z.string().min(1),
});

export const GET = withAuth(async (user) => {
  const connections = await getConnections(user.id);

  return NextResponse.json(connections);
});

export const POST = withAuth(
  async (user, request) => {
    const { data, error } = await parseBody(request, connectSchema);

    if (error) {
      return error;
    }

    const connection = await connectProvider(user.id, data.provider, data.token);

    return NextResponse.json(connection, { status: 201 });
  },
  [
    {
      check: (error) => error instanceof InvalidProviderTokenError,
      respond: () => errorResponse("VALIDATION_ERROR", "Invalid API token", 400),
    },
    ...timeTrackingErrorHandlers,
  ]
);
