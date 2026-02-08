import { NextResponse } from "next/server";
import { recordPayment, getPayments, deletePayment } from "@app/server/invoices";
import { recordPaymentApiSchema } from "@app/shared/schemas";
import {
  withAuth,
  parseBody,
  notFoundResponse,
  errorResponse,
} from "@app/shared/api/route-helpers";

export const GET = withAuth(async (user, _request, context) => {
  const { id } = await context.params;
  const payments = await getPayments(id, user.id);

  if (payments === null) {
    return notFoundResponse("Invoice");
  }

  return NextResponse.json(payments);
});

export const POST = withAuth(async (user, request, context) => {
  const { id } = await context.params;
  const { data, error } = await parseBody(request, recordPaymentApiSchema);

  if (error) {
    return error;
  }

  const invoice = await recordPayment(id, user.id, data);

  if (!invoice) {
    return errorResponse(
      "BAD_REQUEST",
      "Cannot record payment. Invoice may not exist, be a draft, or payment exceeds balance.",
      400
    );
  }

  return NextResponse.json(invoice);
});

export const DELETE = withAuth(async (user, request, context) => {
  const { id: invoiceId } = await context.params;
  const { searchParams } = new URL(request.url);
  const paymentId = searchParams.get("paymentId");

  if (!paymentId) {
    return errorResponse("VALIDATION_ERROR", "Payment ID is required", 400);
  }

  const invoice = await deletePayment(paymentId, user.id);

  if (!invoice) {
    return notFoundResponse("Payment not found or cannot be deleted");
  }

  if (invoice.id !== invoiceId) {
    return errorResponse("BAD_REQUEST", "Payment does not belong to this invoice", 400);
  }

  return NextResponse.json(invoice);
});
