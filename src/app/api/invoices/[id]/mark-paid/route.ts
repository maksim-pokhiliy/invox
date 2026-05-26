import { NextResponse } from "next/server";

import { asInvoiceId } from "@app/shared/types/ids";

import { withIdempotency } from "@app/server/api/idempotency";
import { notFoundResponse, withAuth } from "@app/server/api/route-helpers";
import { markInvoicePaid } from "@app/server/invoices";

export const POST = withAuth(
  withIdempotency(
    async (user, _request, context) => {
      const { id } = await context.params;
      const invoice = await markInvoicePaid(asInvoiceId(id), user.id);

      if (!invoice) {
        return notFoundResponse("Invoice not found or already paid");
      }

      return NextResponse.json(invoice);
    },
    { endpoint: "POST /api/invoices/:id/mark-paid" }
  )
);
