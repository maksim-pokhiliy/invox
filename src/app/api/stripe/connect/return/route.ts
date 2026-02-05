import { NextRequest, NextResponse } from "next/server";
import { getConnectedAccount, isAccountReady } from "@app/server/stripe";

const APP_URL = process.env.APP_URL || "http://localhost:3000";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const accountId = searchParams.get("accountId");
  const userId = searchParams.get("userId");

  if (!accountId || !userId) {
    return NextResponse.redirect(
      new URL("/app/settings?tab=payments&error=missing_params", APP_URL)
    );
  }

  try {
    const account = await getConnectedAccount(accountId);

    if (!account) {
      return NextResponse.redirect(
        new URL("/app/settings?tab=payments&error=account_not_found", APP_URL)
      );
    }

    if (isAccountReady(account)) {
      return NextResponse.redirect(
        new URL("/app/settings?tab=payments&success=stripe_connected", APP_URL)
      );
    }

    return NextResponse.redirect(
      new URL("/app/settings?tab=payments&status=onboarding_incomplete", APP_URL)
    );
  } catch (error) {
    console.error("Stripe return error:", error);
    return NextResponse.redirect(
      new URL("/app/settings?tab=payments&error=verification_failed", APP_URL)
    );
  }
}
