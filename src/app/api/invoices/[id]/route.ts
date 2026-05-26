import { NextResponse } from "next/server";

import { updateInvoiceSchema } from "@app/shared/schemas";
import { asInvoiceId } from "@app/shared/types/ids";

import {
  errorResponse,
  notFoundResponse,
  parseBody,
  withAuth,
} from "@app/server/api/route-helpers";
import {
  ClientNotFoundError,
  deleteInvoice,
  getInvoice,
  MoneyOverflowError,
  updateInvoice,
} from "@app/server/invoices";

export const GET = withAuth(async (user, _request, context) => {
  const { id } = await context.params;
  const invoice = await getInvoice(asInvoiceId(id), user.id);

  if (!invoice) {
    return notFoundResponse("Invoice");
  }

  return NextResponse.json(invoice);
});

export const PATCH = withAuth(
  async (user, request, context) => {
    const { id } = await context.params;
    const { data, error } = await parseBody(request, updateInvoiceSchema);

    if (error) {
      return error;
    }

    const invoice = await updateInvoice(asInvoiceId(id), user.id, data);

    if (!invoice) {
      return notFoundResponse("Invoice");
    }

    return NextResponse.json(invoice);
  },
  [
    {
      check: (error) => error instanceof ClientNotFoundError,
      respond: (error) => errorResponse("NOT_FOUND", error.message, 404),
    },
    {
      check: (error) => error instanceof MoneyOverflowError,
      respond: (error) => errorResponse("BAD_REQUEST", error.message, 400),
    },
  ]
);

export const DELETE = withAuth(async (user, _request, context) => {
  const { id } = await context.params;
  const result = await deleteInvoice(asInvoiceId(id), user.id);

  if (!result) {
    return notFoundResponse("Invoice");
  }

  return NextResponse.json({ success: true });
});
