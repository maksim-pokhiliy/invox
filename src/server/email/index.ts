import { Resend } from "resend";

import { EMAIL } from "@app/shared/config/config";
import { env } from "@app/shared/config/env";
import { formatCurrency, formatDate } from "@app/shared/lib/format";

import {
  buildEmailButton,
  buildEmailFooter,
  buildEmailLayout,
  buildInvoiceDetailsBlock,
  buildLineItemsTable,
  buildLogoBlock,
  type EmailItemGroup,
  type EmailLineItem,
} from "./template";

let resend: Resend | undefined;

function getResend(): Resend {
  if (!resend) {
    resend = new Resend(env.RESEND_API_KEY);
  }

  return resend;
}

export interface EmailBranding {
  primaryColor: string;
  logoUrl: string | null;
  fontFamily: string | null;
  footerText: string | null;
  companyAddress: string | null;
}

interface InvoiceEmailData {
  clientName: string;
  clientEmail: string;
  senderName: string;
  senderEmail: string;
  publicId: string;
  total: number;
  currency: string;
  dueDate: Date;
  branding: EmailBranding;
  paymentReference: string | null;
  items: EmailLineItem[];
  itemGroups?: EmailItemGroup[];
}

function buildBrandingHeader(branding: EmailBranding): string {
  return branding.logoUrl ? buildLogoBlock(branding.logoUrl) : "";
}

function formatItemLine(item: EmailLineItem, currency: string): string {
  return `  ${item.title} — ${item.quantity} × ${formatCurrency(item.unitPrice, currency)} = ${formatCurrency(item.amount, currency)}`;
}

function buildPlainTextItems(
  items: EmailLineItem[],
  itemGroups: EmailItemGroup[] | undefined,
  currency: string
): string {
  const lines: string[] = [];

  if (itemGroups?.length) {
    for (const group of itemGroups) {
      lines.push(`\n  [${group.title}]`);
      lines.push(...group.items.map((item) => formatItemLine(item, currency)));
    }
  }

  lines.push(...items.map((item) => formatItemLine(item, currency)));

  return lines.join("\n");
}

export async function sendInvoiceEmail(data: InvoiceEmailData) {
  const invoiceUrl = `${env.APP_URL}/i/${data.publicId}`;
  const formattedTotal = formatCurrency(data.total, data.currency);
  const formattedDueDate = formatDate(data.dueDate);
  const title = `Invoice from ${data.senderName}`;
  const color = data.branding.primaryColor;

  const bodyHtml = `
    ${buildBrandingHeader(data.branding)}
    <p>Hi ${data.clientName},</p>
    <p>You have received a new invoice for <strong>${formattedTotal}</strong>.</p>
    ${buildInvoiceDetailsBlock(formattedTotal, formattedDueDate, data.paymentReference)}
    ${buildLineItemsTable(data.items, data.currency, data.itemGroups)}
    <p>${buildEmailButton(invoiceUrl, "View Invoice", color)}</p>
    <p style="color: #666; font-size: 14px; margin-top: 30px;">
      If you have any questions about this invoice, please reply to this email or contact ${data.senderName} directly.
    </p>
    ${buildEmailFooter(data.senderName, data.branding.companyAddress, data.branding.footerText)}`;

  const itemsText = buildPlainTextItems(data.items, data.itemGroups, data.currency);
  const referenceText = data.paymentReference ? `Reference: ${data.paymentReference}\n` : "";

  const text = `${title}\n\nHi ${data.clientName},\n\nYou have received a new invoice for ${formattedTotal}.\n\nAmount Due: ${formattedTotal}\nDue Date: ${formattedDueDate}\n${referenceText}\nLine Items:\n${itemsText}\n\nView Invoice: ${invoiceUrl}\n\nIf you have any questions about this invoice, please reply to this email or contact ${data.senderName} directly.`;

  return getResend().emails.send({
    from: env.EMAIL_FROM,
    to: data.clientEmail,
    replyTo: data.senderEmail,
    subject: `${title} - ${formattedTotal}`,
    html: buildEmailLayout(title, color, bodyHtml, data.branding.fontFamily),
    text,
  });
}

export async function sendReminderEmail(data: InvoiceEmailData & { isOverdue: boolean }) {
  const invoiceUrl = `${env.APP_URL}/i/${data.publicId}`;
  const formattedTotal = formatCurrency(data.total, data.currency);
  const formattedDueDate = formatDate(data.dueDate);
  const color = data.isOverdue ? EMAIL.OVERDUE_COLOR : data.branding.primaryColor;
  const title = data.isOverdue
    ? `Overdue Invoice Reminder from ${data.senderName}`
    : `Invoice Reminder from ${data.senderName}`;

  const bodyHtml = `
    ${buildBrandingHeader(data.branding)}
    <p>Hi ${data.clientName},</p>
    <p>This is a friendly reminder about an outstanding invoice for <strong>${formattedTotal}</strong>.</p>
    ${data.isOverdue ? `<p style="color: ${EMAIL.OVERDUE_COLOR};"><strong>This invoice is now overdue.</strong></p>` : ""}
    ${buildInvoiceDetailsBlock(formattedTotal, formattedDueDate, data.paymentReference)}
    ${buildLineItemsTable(data.items, data.currency, data.itemGroups)}
    <p>${buildEmailButton(invoiceUrl, "View & Pay Invoice", color)}</p>
    <p style="color: #666; font-size: 14px; margin-top: 30px;">
      If you have already paid this invoice, please disregard this reminder. For any questions, please contact ${data.senderName} directly.
    </p>
    ${buildEmailFooter(data.senderName, data.branding.companyAddress, data.branding.footerText)}`;

  const itemsText = buildPlainTextItems(data.items, data.itemGroups, data.currency);
  const referenceText = data.paymentReference ? `Reference: ${data.paymentReference}\n` : "";

  const text = `${title}\n\nHi ${data.clientName},\n\nThis is a friendly reminder about an outstanding invoice for ${formattedTotal}.\n\n${data.isOverdue ? "This invoice is now overdue.\n\n" : ""}Amount Due: ${formattedTotal}\nDue Date: ${formattedDueDate}\n${referenceText}\nLine Items:\n${itemsText}\n\nView & Pay Invoice: ${invoiceUrl}\n\nIf you have already paid this invoice, please disregard this reminder. For any questions, please contact ${data.senderName} directly.`;

  return getResend().emails.send({
    from: env.EMAIL_FROM,
    to: data.clientEmail,
    replyTo: data.senderEmail,
    subject: title,
    html: buildEmailLayout(title, color, bodyHtml, data.branding.fontFamily),
    text,
  });
}
