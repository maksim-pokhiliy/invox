import { NextResponse } from "next/server";
import {
  sendInvoice,
  InvoiceNotFoundError,
  InvoiceAlreadySentError,
  EmailFailedError,
} from "@app/server/invoices/send";
import { withAuth, errorResponse } from "@app/shared/api/route-helpers";

export const POST = withAuth(
  async (user, _request, context) => {
    const { id } = await context.params;
    const updated = await sendInvoice(id, user.id);
    return NextResponse.json(updated);
  },
  [
    {
      check: (error) => error instanceof InvoiceNotFoundError,
      respond: (error) => errorResponse("NOT_FOUND", error.message, 404),
    },
    {
      check: (error) => error instanceof InvoiceAlreadySentError,
      respond: (error) => errorResponse("ALREADY_SENT", error.message, 400),
    },
    {
      check: (error) => error instanceof EmailFailedError,
      respond: (error) => errorResponse("EMAIL_FAILED", error.message, 500),
    },
  ]
);
