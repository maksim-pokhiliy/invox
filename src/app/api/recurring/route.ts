import { NextResponse } from "next/server";
import {
  getRecurringInvoices,
  createRecurringInvoice,
  ClientNotFoundError,
} from "@app/server/recurring";
import { createRecurringApiSchema } from "@app/shared/schemas";
import { withAuth, parseBody, notFoundResponse } from "@app/shared/api/route-helpers";

export const GET = withAuth(async (user) => {
  const recurringInvoices = await getRecurringInvoices(user.id);
  return NextResponse.json(recurringInvoices);
});

export const POST = withAuth(
  async (user, request) => {
    const { data, error } = await parseBody(request, createRecurringApiSchema);
    if (error) {
      return error;
    }

    const recurring = await createRecurringInvoice(user.id, data);
    return NextResponse.json(recurring, { status: 201 });
  },
  [
    {
      check: (error) => error instanceof ClientNotFoundError,
      respond: () => notFoundResponse("Client"),
    },
  ]
);
