import { NextResponse } from "next/server";
import { requireUser, AuthenticationError } from "@app/server/auth/require-user";
import {
  createConnectedAccount,
  createAccountLink,
  getConnectedAccount,
  isAccountReady,
  getUserStripeAccountId,
  saveUserStripeAccountId,
} from "@app/server/stripe";

export async function POST() {
  try {
    const user = await requireUser();

    let accountId = await getUserStripeAccountId(user.id);

    if (accountId) {
      const existingAccount = await getConnectedAccount(accountId);

      if (existingAccount && isAccountReady(existingAccount)) {
        return NextResponse.json({
          success: true,
          alreadyConnected: true,
          message: "Stripe account already connected and ready",
        });
      }

      if (!existingAccount) {
        accountId = null;
      }
    }

    if (!accountId) {
      const account = await createConnectedAccount(user.email);
      accountId = account.id;
      await saveUserStripeAccountId(user.id, accountId);
    }

    const accountLink = await createAccountLink(accountId, user.id);

    return NextResponse.json({
      success: true,
      url: accountLink.url,
    });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 }
      );
    }
    console.error("Stripe Connect error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create Stripe connection" } },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await requireUser();

    const accountId = await getUserStripeAccountId(user.id);

    if (!accountId) {
      return NextResponse.json({
        connected: false,
        accountId: null,
        chargesEnabled: false,
        payoutsEnabled: false,
        detailsSubmitted: false,
      });
    }

    const account = await getConnectedAccount(accountId);

    if (!account) {
      return NextResponse.json({
        connected: false,
        accountId,
        chargesEnabled: false,
        payoutsEnabled: false,
        detailsSubmitted: false,
        error: "Account not found",
      });
    }

    return NextResponse.json({
      connected: isAccountReady(account),
      accountId: account.id,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
    });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 }
      );
    }
    console.error("Stripe status error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to get Stripe status" } },
      { status: 500 }
    );
  }
}
