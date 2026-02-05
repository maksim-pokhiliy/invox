import { NextResponse } from "next/server";
import { requireUser, AuthenticationError } from "@app/server/auth/require-user";
import {
  sendInvoice,
  InvoiceNotFoundError,
  InvoiceAlreadySentError,
  EmailFailedError,
} from "@app/server/invoices/send";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const updated = await sendInvoice(id, user.id);

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 }
      );
    }
    if (error instanceof InvoiceNotFoundError) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: error.message } },
        { status: 404 }
      );
    }
    if (error instanceof InvoiceAlreadySentError) {
      return NextResponse.json(
        { error: { code: "ALREADY_SENT", message: error.message } },
        { status: 400 }
      );
    }
    if (error instanceof EmailFailedError) {
      return NextResponse.json(
        { error: { code: "EMAIL_FAILED", message: error.message } },
        { status: 500 }
      );
    }
    console.error("Send invoice error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
