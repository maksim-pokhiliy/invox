import Stripe from "stripe";
import { prisma } from "@app/server/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

const APP_URL = process.env.APP_URL || "http://localhost:3000";
const STRIPE_CLIENT_ID = process.env.STRIPE_CLIENT_ID || "";

export function getStripeConnectUrl(state: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: STRIPE_CLIENT_ID,
    scope: "read_write",
    redirect_uri: `${APP_URL}/api/stripe/connect/callback`,
    state,
  });

  return `https://connect.stripe.com/oauth/authorize?${params.toString()}`;
}

export async function connectStripeAccount(code: string): Promise<string> {
  const response = await stripe.oauth.token({
    grant_type: "authorization_code",
    code,
  });

  if (!response.stripe_user_id) {
    throw new Error("Failed to connect Stripe account");
  }

  return response.stripe_user_id;
}

export async function disconnectStripeAccount(stripeAccountId: string): Promise<void> {
  await stripe.oauth.deauthorize({
    client_id: STRIPE_CLIENT_ID,
    stripe_user_id: stripeAccountId,
  });
}

export async function getConnectedAccount(stripeAccountId: string): Promise<Stripe.Account | null> {
  try {
    return await stripe.accounts.retrieve(stripeAccountId);
  } catch {
    return null;
  }
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

    default:
      return { type: event.type, handled: false };
  }
}

export { stripe };
