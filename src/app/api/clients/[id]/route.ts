import { NextResponse } from "next/server";

import { updateClientSchema } from "@app/shared/schemas";
import { asClientId } from "@app/shared/types/ids";

import {
  errorResponse,
  notFoundResponse,
  parseBody,
  withAuth,
} from "@app/server/api/route-helpers";
import {
  ClientHasDependentsError,
  deleteClient,
  getClient,
  updateClient,
} from "@app/server/clients";

const clientHasDependentsHandler = {
  check: (error: unknown) => error instanceof ClientHasDependentsError,
  respond: (error: Error) => {
    const dependents = error as ClientHasDependentsError;
    const invoiceLabel = `${dependents.invoiceCount} invoice${dependents.invoiceCount === 1 ? "" : "s"}`;

    return errorResponse(
      "CLIENT_HAS_DEPENDENTS",
      `Cannot delete client with ${invoiceLabel}. Delete those first or archive the client instead.`,
      409,
      { invoiceCount: dependents.invoiceCount }
    );
  },
};

export const GET = withAuth(async (user, _request, context) => {
  const { id } = await context.params;
  const client = await getClient(asClientId(id), user.id);

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

  const client = await updateClient(asClientId(id), user.id, data);

  if (!client) {
    return notFoundResponse("Client");
  }

  return NextResponse.json(client);
});

export const DELETE = withAuth(
  async (user, _request, context) => {
    const { id } = await context.params;
    const result = await deleteClient(asClientId(id), user.id);

    if (!result) {
      return notFoundResponse("Client");
    }

    return NextResponse.json({ success: true });
  },
  [clientHasDependentsHandler]
);
