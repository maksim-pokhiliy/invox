import { NextResponse } from "next/server";
import { getClient, updateClient, deleteClient } from "@app/server/clients";
import { withAuth, parseBody, notFoundResponse } from "@app/shared/api/route-helpers";
import { updateClientSchema } from "@app/shared/schemas";

export const GET = withAuth(async (user, _request, context) => {
  const { id } = await context.params;
  const client = await getClient(id, user.id);

  if (!client) {
    return notFoundResponse("Client");
  }

  return NextResponse.json(client);
});

export const PATCH = withAuth(async (user, request, context) => {
  const { id } = await context.params;
  const { data, error } = await parseBody(request, updateClientSchema);

  if (error) {
    return error;
  }

  const client = await updateClient(id, user.id, data);

  if (!client) {
    return notFoundResponse("Client");
  }

  return NextResponse.json(client);
});

export const DELETE = withAuth(async (user, _request, context) => {
  const { id } = await context.params;
  const result = await deleteClient(id, user.id);

  if (!result) {
    return notFoundResponse("Client");
  }

  return NextResponse.json({ success: true });
});
