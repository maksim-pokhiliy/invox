import { Resend } from "resend";
import { formatCurrency, formatDate } from "@app/shared/lib/format";
import { EMAIL } from "@app/shared/config/config";
import { env } from "@app/shared/config/env";
import { buildEmailLayout, buildEmailButton, buildInvoiceDetailsBlock } from "./template";

const resend = new Resend(env.RESEND_API_KEY);

const APP_URL = env.APP_URL;
const EMAIL_FROM = env.EMAIL_FROM;

interface InvoiceEmailData {
  clientName: string;
  clientEmail: string;
  senderName: string;
  senderEmail: string;
  publicId: string;
  total: number;
  currency: string;
  dueDate: Date;
}

export async function sendInvoiceEmail(data: InvoiceEmailData) {
  const invoiceUrl = `${APP_URL}/i/${data.publicId}`;
  const formattedTotal = formatCurrency(data.total, data.currency);
  const formattedDueDate = formatDate(data.dueDate);
  const title = `Invoice from ${data.senderName}`;

  const bodyHtml = `
    <p>Hi ${data.clientName},</p>
    <p>You have received a new invoice for <strong>${formattedTotal}</strong>.</p>
    ${buildInvoiceDetailsBlock(formattedTotal, formattedDueDate)}
    <p>${buildEmailButton(invoiceUrl, "View Invoice", EMAIL.PRIMARY_COLOR)}</p>
    <p style="color: #666; font-size: 14px; margin-top: 30px;">
      If you have any questions about this invoice, please reply to this email or contact ${data.senderName} directly.
    </p>`;

  const text = `${title}\n\nHi ${data.clientName},\n\nYou have received a new invoice for ${formattedTotal}.\n\nAmount Due: ${formattedTotal}\nDue Date: ${formattedDueDate}\n\nView Invoice: ${invoiceUrl}\n\nIf you have any questions about this invoice, please reply to this email or contact ${data.senderName} directly.`;

  return resend.emails.send({
    from: EMAIL_FROM,
    to: data.clientEmail,
    replyTo: data.senderEmail,
    subject: `${title} - ${formattedTotal}`,
    html: buildEmailLayout(title, EMAIL.PRIMARY_COLOR, bodyHtml),
    text,
  });
}

export async function sendReminderEmail(data: InvoiceEmailData & { isOverdue: boolean }) {
  const invoiceUrl = `${APP_URL}/i/${data.publicId}`;
  const formattedTotal = formatCurrency(data.total, data.currency);
  const formattedDueDate = formatDate(data.dueDate);
  const color = data.isOverdue ? EMAIL.OVERDUE_COLOR : EMAIL.PRIMARY_COLOR;
  const title = data.isOverdue
    ? `Overdue Invoice Reminder from ${data.senderName}`
    : `Invoice Reminder from ${data.senderName}`;

  const bodyHtml = `
    <p>Hi ${data.clientName},</p>
    <p>This is a friendly reminder about an outstanding invoice for <strong>${formattedTotal}</strong>.</p>
    ${data.isOverdue ? `<p style="color: ${EMAIL.OVERDUE_COLOR};"><strong>This invoice is now overdue.</strong></p>` : ""}
    ${buildInvoiceDetailsBlock(formattedTotal, formattedDueDate)}
    <p>${buildEmailButton(invoiceUrl, "View & Pay Invoice", color)}</p>
    <p style="color: #666; font-size: 14px; margin-top: 30px;">
      If you have already paid this invoice, please disregard this reminder. For any questions, please contact ${data.senderName} directly.
    </p>`;

  const text = `${title}\n\nHi ${data.clientName},\n\nThis is a friendly reminder about an outstanding invoice for ${formattedTotal}.\n\n${data.isOverdue ? "This invoice is now overdue.\n\n" : ""}Amount Due: ${formattedTotal}\nDue Date: ${formattedDueDate}\n\nView & Pay Invoice: ${invoiceUrl}\n\nIf you have already paid this invoice, please disregard this reminder. For any questions, please contact ${data.senderName} directly.`;

  return resend.emails.send({
    from: EMAIL_FROM,
    to: data.clientEmail,
    replyTo: data.senderEmail,
    subject: title,
    html: buildEmailLayout(title, color, bodyHtml),
    text,
  });
}
