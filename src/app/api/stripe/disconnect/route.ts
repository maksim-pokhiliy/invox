import { NextResponse } from "next/server";
import { requireUser, AuthenticationError } from "@app/server/auth/require-user";
import { deleteConnectedAccount, removeUserStripeAccountId } from "@app/server/stripe";

export async function POST() {
  try {
    const user = await requireUser();

    const stripeAccountId = await removeUserStripeAccountId(user.id);

    if (!stripeAccountId) {
      return NextResponse.json(
        { error: { code: "NOT_CONNECTED", message: "No Stripe account connected" } },
        { status: 400 }
      );
    }

    try {
      await deleteConnectedAccount(stripeAccountId);
    } catch (err) {
      console.error("Failed to delete Stripe account:", err);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 }
      );
    }
    console.error("Stripe disconnect error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to disconnect Stripe account" } },
      { status: 500 }
    );
  }
}
