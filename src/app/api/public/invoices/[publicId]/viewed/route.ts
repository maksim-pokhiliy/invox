import { NextResponse } from "next/server";

import { getUser } from "@app/server/auth/require-user";
import { getInvoiceByPublicId, markInvoiceViewed } from "@app/server/invoices";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    const { publicId } = await params;

    const invoice = await getInvoiceByPublicId(publicId);

    if (!invoice) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Invoice not found" } },
        { status: 404 }
      );
    }

    const user = await getUser();

    if (user?.id !== invoice.userId) {
      await markInvoiceViewed(publicId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mark invoice viewed error:", error);

    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
