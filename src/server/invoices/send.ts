import type { SenderProfile } from "@prisma/client";
import { customAlphabet } from "nanoid";

import { BANKING, BRANDING } from "@app/shared/config/config";
import { INVOICE_EVENT, INVOICE_STATUS } from "@app/shared/config/invoice-status";

import { prisma } from "@app/server/db";
import { type EmailBranding, sendInvoiceEmail } from "@app/server/email";
import { getFollowUpRule, parseDelaysDays, scheduleFollowUps } from "@app/server/followups";
import { logInvoiceEvent, updateInvoiceStatus } from "@app/server/invoices";
import { ITEM_GROUPS_INCLUDE } from "@app/server/invoices/item-groups";

const generateReference = customAlphabet(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  BANKING.PAYMENT_REFERENCE_LENGTH
);

export class InvoiceNotFoundError extends Error {
  constructor() {
    super("Invoice not found");
    this.name = "InvoiceNotFoundError";
  }
}

export class InvoiceAlreadySentError extends Error {
  constructor() {
    super("Invoice has already been sent");
    this.name = "InvoiceAlreadySentError";
  }
}

export class EmailFailedError extends Error {
  constructor() {
    super("Failed to send invoice email");
    this.name = "EmailFailedError";
  }
}

function buildEmailBranding(profile: SenderProfile | null): EmailBranding {
  return {
    primaryColor: profile?.primaryColor || BRANDING.DEFAULT_PRIMARY_COLOR,
    logoUrl: profile?.logoUrl || null,
    fontFamily: profile?.fontFamily || null,
    footerText: profile?.footerText || null,
    companyAddress: profile?.address || null,
  };
}

function resolveSenderInfo(profile: SenderProfile | null, userEmail: string) {
  return {
    name: profile?.companyName || profile?.displayName || userEmail,
    email: profile?.emailFrom || userEmail,
    prefix: profile?.invoicePrefix || BANKING.PAYMENT_REFERENCE_PREFIX,
  };
}

export async function sendInvoice(invoiceId: string, userId: string) {
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, userId },
    include: {
      client: true,
      items: { where: { groupId: null }, orderBy: { sortOrder: "asc" } },
      itemGroups: ITEM_GROUPS_INCLUDE,
      user: {
        include: {
          senderProfile: true,
        },
      },
    },
  });

  if (!invoice) {
    throw new InvoiceNotFoundError();
  }

  if (invoice.status !== INVOICE_STATUS.DRAFT) {
    throw new InvoiceAlreadySentError();
  }

  const sender = resolveSenderInfo(invoice.user.senderProfile, invoice.user.email);
  const paymentReference = `${sender.prefix}-${generateReference()}`;
  const branding = buildEmailBranding(invoice.user.senderProfile);

  try {
    await sendInvoiceEmail({
      clientName: invoice.client.name,
      clientEmail: invoice.client.email,
      senderName: sender.name,
      senderEmail: sender.email,
      publicId: invoice.publicId,
      total: invoice.total,
      currency: invoice.currency,
      dueDate: invoice.dueDate,
      branding,
      paymentReference,
      items: invoice.items.map((item) => ({
        title: item.title,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.amount,
      })),
      itemGroups: invoice.itemGroups.map((group) => ({
        title: group.title,
        items: group.items.map((item) => ({
          title: item.title,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.amount,
        })),
      })),
    });
  } catch (emailError) {
    console.error("Failed to send email:", emailError);
    throw new EmailFailedError();
  }

  const sentAt = new Date();

  await updateInvoiceStatus(invoice.id, INVOICE_STATUS.SENT, { sentAt, paymentReference });
  await logInvoiceEvent(invoice.id, INVOICE_EVENT.SENT, { clientEmail: invoice.client.email });

  const followUpRule = await getFollowUpRule(userId);

  if (followUpRule?.enabled) {
    await scheduleFollowUps(invoice.id, sentAt, invoice.dueDate, {
      mode: followUpRule.mode,
      delaysDays: parseDelaysDays(followUpRule.delaysDays),
    });
  }

  return prisma.invoice.findUnique({
    where: { id: invoice.id },
    include: {
      client: true,
      items: { where: { groupId: null }, orderBy: { sortOrder: "asc" } },
      itemGroups: ITEM_GROUPS_INCLUDE,
    },
  });
}
