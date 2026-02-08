import { NextResponse } from "next/server";
import { getInvoice, updateInvoice, deleteInvoice } from "@app/server/invoices";
import { withAuth, parseBody, notFoundResponse } from "@app/shared/api/route-helpers";
import { updateInvoiceSchema } from "@app/shared/schemas";

export const GET = withAuth(async (user, _request, context) => {
  const { id } = await context.params;
  const invoice = await getInvoice(id, user.id);

  if (!invoice) {
    return notFoundResponse("Invoice");
  }

  return NextResponse.json(invoice);
});

export const PATCH = withAuth(async (user, request, context) => {
  const { id } = await context.params;
  const { data, error } = await parseBody(request, updateInvoiceSchema);

  if (error) {
    return error;
  }

  const invoice = await updateInvoice(id, user.id, data);

  if (!invoice) {
    return notFoundResponse("Invoice");
  }

  return NextResponse.json(invoice);
});

export const DELETE = withAuth(async (user, _request, context) => {
  const { id } = await context.params;
  const result = await deleteInvoice(id, user.id);

  if (!result) {
    return notFoundResponse("Invoice");
  }

  return NextResponse.json({ success: true });
});
