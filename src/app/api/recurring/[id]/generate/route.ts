import { NextResponse } from "next/server";
import { getRecurringInvoice, generateInvoiceFromRecurring } from "@app/server/recurring";
import { withAuth, notFoundResponse, errorResponse } from "@app/shared/api/route-helpers";

export const POST = withAuth(async (user, _request, context) => {
  const { id } = await context.params;
  const recurring = await getRecurringInvoice(user.id, id);

  if (!recurring) {
    return notFoundResponse("Recurring invoice");
  }

  if (recurring.status !== "ACTIVE") {
    return errorResponse("INVALID_STATE", "Recurring invoice is not active", 400);
  }

  const invoice = await generateInvoiceFromRecurring(recurring);

  return NextResponse.json({
    success: true,
    invoiceId: invoice.id,
    publicId: invoice.publicId,
  });
});
