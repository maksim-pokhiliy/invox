import { NextRequest, NextResponse } from "next/server";
import { createAccountLink, getUserStripeAccountId } from "@app/server/stripe";

const APP_URL = process.env.APP_URL || "http://localhost:3000";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.redirect(
      new URL("/app/settings?tab=payments&error=missing_params", APP_URL)
    );
  }

  try {
    const stripeAccountId = await getUserStripeAccountId(userId);

    if (!stripeAccountId) {
      return NextResponse.redirect(new URL("/app/settings?tab=payments&error=no_account", APP_URL));
    }

    const accountLink = await createAccountLink(stripeAccountId, userId);

    return NextResponse.redirect(accountLink.url);
  } catch (error) {
    console.error("Stripe refresh error:", error);
    return NextResponse.redirect(
      new URL("/app/settings?tab=payments&error=refresh_failed", APP_URL)
    );
  }
}
