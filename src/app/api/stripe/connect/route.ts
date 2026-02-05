import { NextResponse } from "next/server";
import { requireUser, AuthenticationError } from "@app/server/auth/require-user";
import { getStripeConnectUrl } from "@app/server/stripe";
import { randomBytes } from "crypto";
import { VALIDATION } from "@app/lib/constants";

export async function GET() {
  try {
    const user = await requireUser();

    const state = Buffer.from(
      JSON.stringify({
        userId: user.id,
        nonce: randomBytes(VALIDATION.STATE_LENGTH).toString("hex"),
        timestamp: Date.now(),
      })
    ).toString("base64url");

    const url = getStripeConnectUrl(state);

    return NextResponse.redirect(url);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.redirect(new URL("/auth/sign-in", process.env.APP_URL));
    }
    console.error("Stripe Connect error:", error);
    return NextResponse.redirect(
      new URL("/app/settings?error=stripe_connect_failed", process.env.APP_URL)
    );
  }
}
