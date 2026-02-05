import { NextRequest, NextResponse } from "next/server";
import { connectStripeAccount } from "@app/server/stripe";
import { connectUserStripe } from "@app/server/user";
import { AUTH } from "@app/lib/constants";

const APP_URL = process.env.APP_URL || "http://localhost:3000";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  if (error) {
    console.error("Stripe Connect error:", error, errorDescription);
    return NextResponse.redirect(
      new URL(`/app/settings?tab=payments&error=${encodeURIComponent(error)}`, APP_URL)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/app/settings?tab=payments&error=missing_params", APP_URL)
    );
  }

  try {
    const stateData = JSON.parse(Buffer.from(state, "base64url").toString());

    if (Date.now() - stateData.timestamp > AUTH.STATE_MAX_AGE) {
      return NextResponse.redirect(
        new URL("/app/settings?tab=payments&error=state_expired", APP_URL)
      );
    }

    const userId = stateData.userId;

    if (!userId) {
      return NextResponse.redirect(
        new URL("/app/settings?tab=payments&error=invalid_state", APP_URL)
      );
    }

    const stripeAccountId = await connectStripeAccount(code);
    await connectUserStripe(userId, stripeAccountId);

    return NextResponse.redirect(
      new URL("/app/settings?tab=payments&success=stripe_connected", APP_URL)
    );
  } catch (err) {
    console.error("Stripe Connect callback error:", err);
    return NextResponse.redirect(
      new URL("/app/settings?tab=payments&error=connection_failed", APP_URL)
    );
  }
}
