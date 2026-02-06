import { NextResponse } from "next/server";
import { requireUser, AuthenticationError } from "@app/server/auth/require-user";
import { getPendingTransactions, getRecentAutoMatched } from "@app/server/banking/matching";

export async function GET() {
  try {
    const user = await requireUser();

    const [pending, autoMatched] = await Promise.all([
      getPendingTransactions(user.id),
      getRecentAutoMatched(user.id),
    ]);

    return NextResponse.json({ pending, autoMatched });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 }
      );
    }
    console.error("Get bank transactions error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
