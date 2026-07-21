import { NextResponse } from "next/server";

import { createServiceSchema } from "@app/shared/schemas";

import { parseBody, withAuth } from "@app/server/api/route-helpers";
import { createService, getServices } from "@app/server/services";

export const GET = withAuth(async (user) => {
  const services = await getServices(user.id);

  return NextResponse.json(services);
});

export const POST = withAuth(async (user, request) => {
  const { data, error } = await parseBody(request, createServiceSchema);

  if (error) {
    return error;
  }

  const service = await createService(user.id, data);

  return NextResponse.json(service, { status: 201 });
});
