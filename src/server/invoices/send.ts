import type { Prisma, SenderProfile } from "@prisma/client";
import { customAlphabet } from "nanoid";

import { INVOICE } from "@app/shared/config/config";
import { EMAIL_OUTBOX_KIND, EMAIL_OUTBOX_RELATED_TYPE } from "@app/shared/config/email-outbox";
import { INVOICE_EVENT, INVOICE_STATUS } from "@app/shared/config/invoice-status";
import { asInvoiceId, type InvoiceId, type UserId } from "@app/shared/types/ids";

import { prisma } from "@app/server/db";
import {
  buildInvoiceEmailPayload,
  type EmailBranding,
  type InvoiceEmailData,
  type ResendEmailPayload,
} from "@app/server/email";
import {
  buildEmailBranding,
  mapInvoiceItem,
  mapInvoiceItemGroups,
} from "@app/server/email/invoice-email-dto";
import { createStableOutbox } from "@app/server/email/outbox";
import { type InvoiceWithRelations, logInvoiceEvent } from "@app/server/invoices";
import { ITEM_GROUPS_INCLUDE } from "@app/server/invoices/item-groups";

const generateReference = customAlphabet(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  INVOICE.PAYMENT_REFERENCE_LENGTH
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

function resolveSenderInfo(profile: SenderProfile | null, userEmail: string) {
  return {
    name: profile?.companyName || profile?.displayName || userEmail,
    email: profile?.emailFrom || userEmail,
    prefix: profile?.invoicePrefix || INVOICE.PAYMENT_REFERENCE_PREFIX,
  };
}

const INVOICE_FOR_SEND_INCLUDE = {
  client: true,
  items: { where: { groupId: null }, orderBy: { sortOrder: "asc" as const } },
  itemGroups: ITEM_GROUPS_INCLUDE,
  user: { include: { senderProfile: true } },
};

type InvoiceForSend = Prisma.InvoiceGetPayload<{ include: typeof INVOICE_FOR_SEND_INCLUDE }>;

async function loadInvoiceForSend(invoiceId: InvoiceId, userId: UserId): Promise<InvoiceForSend> {
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, userId },
    include: INVOICE_FOR_SEND_INCLUDE,
  });

  if (!invoice) {
    throw new InvoiceNotFoundError();
  }

  if (invoice.status !== INVOICE_STATUS.DRAFT) {
    throw new InvoiceAlreadySentError();
  }

  return invoice;
}

interface BuildEmailContext {
  senderName: string;
  senderEmail: string;
  paymentReference: string;
  branding: EmailBranding;
}

function buildSendContext(invoice: InvoiceForSend): BuildEmailContext {
  const sender = resolveSenderInfo(invoice.user.senderProfile, invoice.user.email);

  return {
    senderName: sender.name,
    senderEmail: sender.email,
    paymentReference: `${sender.prefix}-${generateReference()}`,
    branding: buildEmailBranding(invoice.user.senderProfile),
  };
}

function buildInvoiceEmailData(invoice: InvoiceForSend, ctx: BuildEmailContext): InvoiceEmailData {
  return {
    clientName: invoice.client.name,
    clientEmail: invoice.client.email,
    senderName: ctx.senderName,
    senderEmail: ctx.senderEmail,
    publicId: invoice.publicId,
    total: invoice.total,
    currency: invoice.currency,
    dueDate: invoice.dueDate,
    periodStart: invoice.periodStart,
    periodEnd: invoice.periodEnd,
    message: invoice.message,
    branding: ctx.branding,
    paymentReference: ctx.paymentReference,
    items: invoice.items.map(mapInvoiceItem),
    itemGroups: mapInvoiceItemGroups(invoice.itemGroups),
  };
}

interface CommitSendInvoiceInput {
  invoice: InvoiceForSend;
  userId: UserId;
  paymentReference: string;
  sentAt: Date;
  payload: ResendEmailPayload;
}

async function commitSendInvoice(input: CommitSendInvoiceInput): Promise<string> {
  const { invoice, userId, paymentReference, sentAt, payload } = input;
  const invoiceId = asInvoiceId(invoice.id);

  return prisma.$transaction(async (tx) => {
    const claimed = await tx.invoice.updateMany({
      where: { id: invoiceId, status: INVOICE_STATUS.DRAFT },
      data: { status: INVOICE_STATUS.SENT, sentAt, paymentReference },
    });

    if (claimed.count !== 1) {
      throw new InvoiceAlreadySentError();
    }

    await logInvoiceEvent(invoiceId, INVOICE_EVENT.SENT, { clientEmail: invoice.client.email }, tx);

    const row = await createStableOutbox(tx, {
      userId,
      kind: EMAIL_OUTBOX_KIND.INVOICE,
      relatedType: EMAIL_OUTBOX_RELATED_TYPE.INVOICE,
      relatedId: invoiceId,
      payload,
    });

    return row.id;
  });
}

export interface SendInvoiceResult {
  invoice: InvoiceWithRelations | null;
  outboxId: string;
}

export async function sendInvoice(
  invoiceId: InvoiceId,
  userId: UserId
): Promise<SendInvoiceResult> {
  const invoice = await loadInvoiceForSend(invoiceId, userId);
  const ctx = buildSendContext(invoice);
  const sentAt = new Date();
  const emailData = buildInvoiceEmailData(invoice, ctx);
  const payload = buildInvoiceEmailPayload(emailData);

  const outboxId = await commitSendInvoice({
    invoice,
    userId,
    paymentReference: ctx.paymentReference,
    sentAt,
    payload,
  });

  const updated = await prisma.invoice.findUnique({
    where: { id: invoice.id },
    include: {
      client: true,
      items: { where: { groupId: null }, orderBy: { sortOrder: "asc" } },
      itemGroups: ITEM_GROUPS_INCLUDE,
    },
  });

  return { invoice: updated, outboxId };
}
