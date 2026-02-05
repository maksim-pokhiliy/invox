import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, AuthenticationError } from "@app/server/auth/require-user";
import { recordPayment, getPayments, deletePayment } from "@app/server/invoices";

const recordPaymentSchema = z.object({
  amount: z.number().positive(),
  method: z.enum(["STRIPE", "MANUAL"]),
  note: z.string().optional(),
  paidAt: z.coerce.date().optional(),
});

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const payments = await getPayments(id, user.id);

    if (payments === null) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Invoice not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json(payments);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 }
      );
    }
    console.error("Get payments error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = await request.json();
    const parsed = recordPaymentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.issues[0]?.message ?? "Invalid input",
          },
        },
        { status: 400 }
      );
    }

    const invoice = await recordPayment(id, user.id, parsed.data);

    if (!invoice) {
      return NextResponse.json(
        {
          error: {
            code: "BAD_REQUEST",
            message:
              "Cannot record payment. Invoice may not exist, be a draft, or payment exceeds balance.",
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(invoice);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 }
      );
    }
    console.error("Record payment error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id: invoiceId } = await params;
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get("paymentId");

    if (!paymentId) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Payment ID is required" } },
        { status: 400 }
      );
    }

    const invoice = await deletePayment(paymentId, user.id);

    if (!invoice) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Payment not found or cannot be deleted" } },
        { status: 404 }
      );
    }

    if (invoice.id !== invoiceId) {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "Payment does not belong to this invoice" } },
        { status: 400 }
      );
    }

    return NextResponse.json(invoice);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 }
      );
    }
    console.error("Delete payment error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
