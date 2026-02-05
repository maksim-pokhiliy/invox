import { prisma } from "@app/server/db";
import { sendInvoiceEmail } from "@app/server/email";
import { getFollowUpRule, scheduleFollowUps } from "@app/server/followups";
import { logInvoiceEvent, updateInvoiceStatus } from "@app/server/invoices";

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

export async function sendInvoice(invoiceId: string, userId: string) {
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, userId },
    include: {
      client: true,
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

  if (invoice.status !== "DRAFT") {
    throw new InvoiceAlreadySentError();
  }

  const senderName =
    invoice.user.senderProfile?.companyName ||
    invoice.user.senderProfile?.displayName ||
    invoice.user.email;

  const senderEmail = invoice.user.senderProfile?.emailFrom || invoice.user.email;

  try {
    await sendInvoiceEmail({
      clientName: invoice.client.name,
      clientEmail: invoice.client.email,
      senderName,
      senderEmail,
      publicId: invoice.publicId,
      total: invoice.total,
      currency: invoice.currency,
      dueDate: invoice.dueDate,
    });
  } catch (emailError) {
    console.error("Failed to send email:", emailError);
    throw new EmailFailedError();
  }

  const sentAt = new Date();

  await updateInvoiceStatus(invoice.id, "SENT", { sentAt });
  await logInvoiceEvent(invoice.id, "SENT", { clientEmail: invoice.client.email });

  const followUpRule = await getFollowUpRule(userId);
  if (followUpRule?.enabled) {
    await scheduleFollowUps(invoice.id, sentAt, invoice.dueDate, {
      mode: followUpRule.mode,
      delaysDays: followUpRule.delaysDays as number[],
    });
  }

  return prisma.invoice.findUnique({
    where: { id: invoice.id },
    include: {
      client: true,
      items: true,
    },
  });
}
