import { NextResponse } from "next/server";
import { duplicateInvoice } from "@app/server/invoices";
import { withAuth, notFoundResponse } from "@app/shared/api/route-helpers";

export const POST = withAuth(async (user, _request, context) => {
  const { id } = await context.params;
  const invoice = await duplicateInvoice(id, user.id);

  if (!invoice) {
    return notFoundResponse("Invoice");
  }

  return NextResponse.json(invoice);
});
