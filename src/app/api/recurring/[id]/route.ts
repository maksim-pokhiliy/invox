import { NextResponse } from "next/server";
import {
  getRecurringInvoice,
  updateRecurringInvoice,
  deleteRecurringInvoice,
  RecurringInvoiceNotFoundError,
} from "@app/server/recurring";
import { withAuth, parseBody, notFoundResponse } from "@app/shared/api/route-helpers";
import { updateRecurringApiSchema } from "@app/shared/schemas";

const recurringNotFoundHandler = {
  check: (error: unknown) => error instanceof RecurringInvoiceNotFoundError,
  respond: () => notFoundResponse("Recurring invoice"),
};

export const GET = withAuth(async (user, _request, context) => {
  const { id } = await context.params;
  const recurring = await getRecurringInvoice(user.id, id);

  if (!recurring) {
    return notFoundResponse("Recurring invoice");
  }

  return NextResponse.json(recurring);
});

export const PATCH = withAuth(
  async (user, request, context) => {
    const { id } = await context.params;
    const { data, error } = await parseBody(request, updateRecurringApiSchema);

    if (error) {
      return error;
    }

    const recurring = await updateRecurringInvoice(user.id, id, data);
    return NextResponse.json(recurring);
  },
  [recurringNotFoundHandler]
);

export const DELETE = withAuth(
  async (user, _request, context) => {
    const { id } = await context.params;
    await deleteRecurringInvoice(user.id, id);
    return NextResponse.json({ success: true });
  },
  [recurringNotFoundHandler]
);
