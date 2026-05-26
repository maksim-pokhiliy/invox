import { NextResponse } from "next/server";

import { createInvoiceSchema } from "@app/shared/schemas";

import { withIdempotency } from "@app/server/api/idempotency";
import { errorResponse, parseBody, withAuth } from "@app/server/api/route-helpers";
import {
  ClientNotFoundError,
  createInvoice,
  getInvoices,
  MoneyOverflowError,
} from "@app/server/invoices";

export const GET = withAuth(async (user) => {
  const invoices = await getInvoices(user.id);

  return NextResponse.json(invoices);
});

export const POST = withAuth(
  withIdempotency(
    async (user, request) => {
      const { data, error } = await parseBody(request, createInvoiceSchema);

      if (error) {
        return error;
      }

      const invoice = await createInvoice(user.id, data);

      return NextResponse.json(invoice, { status: 201 });
    },
    { endpoint: "POST /api/invoices" }
  ),
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
