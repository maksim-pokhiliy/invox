import { NextResponse } from "next/server";

import { createClientSchema } from "@app/shared/schemas";

import { parseBody, withAuth } from "@app/server/api/route-helpers";
import { createClient, getClients } from "@app/server/clients";

export const GET = withAuth(async (user) => {
  const clients = await getClients(user.id);

  return NextResponse.json(clients);
});

export const POST = withAuth(async (user, request) => {
  const { data, error } = await parseBody(request, createClientSchema);

  if (error) {
    return error;
  }

  const client = await createClient(user.id, data);

  return NextResponse.json(client, { status: 201 });
});
