import Stripe from "stripe";
import { prisma } from "@app/server/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

const APP_URL = process.env.APP_URL || "http://localhost:3000";

/**
 * Create a new Stripe Connected Account for a user
 */
export async function createConnectedAccount(email: string): Promise<Stripe.Account> {
  return stripe.accounts.create({
    type: "express",
    email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  });
}

/**
 * Create an Account Link for onboarding
 */
export async function createAccountLink(
  accountId: string,
  userId: string
): Promise<Stripe.AccountLink> {
  return stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${APP_URL}/api/stripe/connect/refresh?userId=${userId}`,
    return_url: `${APP_URL}/api/stripe/connect/return?accountId=${accountId}&userId=${userId}`,
    type: "account_onboarding",
  });
}

/**
 * Get account status and check if onboarding is complete
 */
export async function getConnectedAccount(accountId: string): Promise<Stripe.Account | null> {
  try {
    return await stripe.accounts.retrieve(accountId);
  } catch {
    return null;
  }
}

/**
 * Check if account has completed onboarding and can accept payments
 */
export function isAccountReady(account: Stripe.Account): boolean {
  return (
    account.charges_enabled === true &&
    account.payouts_enabled === true &&
    account.details_submitted === true
  );
}

/**
 * Delete a connected account (optional, for cleanup)
 */
export async function deleteConnectedAccount(accountId: string): Promise<void> {
  try {
    await stripe.accounts.del(accountId);
  } catch (error) {
    console.error("Failed to delete connected account:", error);
  }
}

/**
 * Get user's Stripe account ID from sender profile
 */
export async function getUserStripeAccountId(userId: string): Promise<string | null> {
  const profile = await prisma.senderProfile.findUnique({
    where: { userId },
  });
  return profile?.stripeAccountId ?? null;
}

/**
 * Save Stripe account ID to user's sender profile
 */
export async function saveUserStripeAccountId(
  userId: string,
  stripeAccountId: string
): Promise<void> {
  await prisma.senderProfile.upsert({
    where: { userId },
    update: { stripeAccountId },
    create: {
      userId,
      stripeAccountId,
      defaultCurrency: "USD",
    },
  });
}

/**
 * Remove Stripe account ID from user's sender profile
 */
export async function removeUserStripeAccountId(userId: string): Promise<string | null> {
  const profile = await prisma.senderProfile.findUnique({
    where: { userId },
  });

  if (!profile?.stripeAccountId) {
    return null;
  }

  const stripeAccountId = profile.stripeAccountId;

  await prisma.senderProfile.update({
    where: { userId },
    data: { stripeAccountId: null },
  });

  return stripeAccountId;
}

export async function createCheckoutSession(invoiceId: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      client: true,
      items: true,
      user: {
        include: {
          senderProfile: true,
        },
      },
    },
  });

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  if (invoice.status === "PAID" || invoice.paidAt) {
    throw new Error("Invoice is already paid");
  }

  const senderName =
    invoice.user.senderProfile?.companyName ||
    invoice.user.senderProfile?.displayName ||
    invoice.user.email;

  const stripeAccountId = invoice.user.senderProfile?.stripeAccountId;

  const sessionOptions: Stripe.Checkout.SessionCreateParams = {
    mode: "payment",
    customer_email: invoice.client.email,
    line_items: invoice.items.map((item) => ({
      price_data: {
        currency: invoice.currency.toLowerCase(),
        product_data: {
          name: item.description,
        },
        unit_amount: item.unitPrice,
      },
      quantity: item.quantity,
    })),
    metadata: {
      invoiceId: invoice.id,
      publicId: invoice.publicId,
    },
    success_url: `${APP_URL}/i/${invoice.publicId}?paid=1`,
    cancel_url: `${APP_URL}/i/${invoice.publicId}?canceled=1`,
    payment_intent_data: {
      description: `Invoice ${invoice.publicId} from ${senderName}`,
    },
  };

  if (stripeAccountId) {
    sessionOptions.payment_intent_data = {
      ...sessionOptions.payment_intent_data,
      transfer_data: {
        destination: stripeAccountId,
      },
    };
  }

  const session = await stripe.checkout.sessions.create(sessionOptions);

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { stripeCheckoutSessionId: session.id },
  });

  return session;
}

export async function handleWebhookEvent(
  body: string,
  signature: string
): Promise<{ type: string; handled: boolean }> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error("Stripe webhook secret not configured");
  }

  const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.payment_status === "paid" && session.metadata?.invoiceId) {
        const invoice = await prisma.invoice.findFirst({
          where: {
            id: session.metadata.invoiceId,
            paidAt: null,
          },
        });

        if (invoice) {
          await prisma.invoice.update({
            where: { id: invoice.id },
            data: {
              status: "PAID",
              paidAt: new Date(),
              paymentMethod: "STRIPE",
            },
          });

          await prisma.invoiceEvent.create({
            data: {
              invoiceId: invoice.id,
              type: "PAID_STRIPE",
              payload: {
                checkoutSessionId: session.id,
                paymentIntent:
                  typeof session.payment_intent === "string"
                    ? session.payment_intent
                    : (session.payment_intent?.id ?? null),
              },
            },
          });

          await prisma.followUpJob.updateMany({
            where: { invoiceId: invoice.id, status: "PENDING" },
            data: { status: "CANCELED" },
          });
        }
      }

      return { type: event.type, handled: true };
    }

    case "account.updated": {
      const account = event.data.object as Stripe.Account;

      if (account.id) {
        const profile = await prisma.senderProfile.findFirst({
          where: { stripeAccountId: account.id },
        });

        if (profile) {
          console.warn(
            `Stripe account ${account.id} updated: charges_enabled=${account.charges_enabled}, payouts_enabled=${account.payouts_enabled}`
          );
        }
      }

      return { type: event.type, handled: true };
    }

    default:
      return { type: event.type, handled: false };
  }
}

export { stripe };
