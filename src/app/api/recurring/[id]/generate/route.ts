import { NextResponse } from "next/server";
import { requireUser, AuthenticationError } from "@app/server/auth/require-user";
import { getRecurringInvoice, generateInvoiceFromRecurring } from "@app/server/recurring";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, { params }: RouteParams) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const recurring = await getRecurringInvoice(user.id, id);

    if (!recurring) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Recurring invoice not found" } },
        { status: 404 }
      );
    }

    if (recurring.status !== "ACTIVE") {
      return NextResponse.json(
        { error: { code: "INVALID_STATE", message: "Recurring invoice is not active" } },
        { status: 400 }
      );
    }

    const invoice = await generateInvoiceFromRecurring(recurring);

    return NextResponse.json({
      success: true,
      invoiceId: invoice.id,
      publicId: invoice.publicId,
    });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 }
      );
    }
    console.error("Generate invoice error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to generate invoice" } },
      { status: 500 }
    );
  }
}
