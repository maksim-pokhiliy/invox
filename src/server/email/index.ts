import { Resend } from "resend";

import { EMAIL } from "@app/shared/config/config";
import { env } from "@app/shared/config/env";
import { SEO } from "@app/shared/config/seo";
import { formatCurrency, formatDate } from "@app/shared/lib/format";

import {
  buildBrandingHeader,
  buildEmailButton,
  buildEmailFooter,
  buildEmailLayout,
  buildInvoiceDetailsBlock,
  buildLineItemsTable,
  buildPlainTextItems,
  type EmailItemGroup,
  type EmailLineItem,
} from "./template";

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
  periodStart: Date | null;
  periodEnd: Date | null;
  message: string | null;
  branding: EmailBranding;
  paymentReference: string | null;
  items: EmailLineItem[];
  itemGroups?: EmailItemGroup[];
}

let resend: Resend | undefined;

function getResend(): Resend {
  if (!resend) {
    resend = new Resend(env.RESEND_API_KEY);
  }

  return resend;
}

export async function sendInvoiceEmail(data: InvoiceEmailData) {
  const invoiceUrl = `${env.APP_URL}/i/${data.publicId}`;
  const formattedTotal = formatCurrency(data.total, data.currency);
  const formattedDueDate = formatDate(data.dueDate);
  const title = `Invoice from ${data.senderName}`;
  const color = data.branding.primaryColor;

  const periodHtml =
    data.periodStart && data.periodEnd
      ? `<p style="margin: 10px 0 0;"><strong>Billing Period:</strong> ${formatDate(data.periodStart)} — ${formatDate(data.periodEnd)}</p>`
      : "";

  const messageHtml = data.message
    ? `<div style="background: ${color}05; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0 0 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #666; font-weight: 600;">Message</p>
        <p style="margin: 0; font-size: 14px; white-space: pre-line;">${data.message}</p>
      </div>`
    : "";

  const bodyHtml = `
    ${buildBrandingHeader(data.branding.logoUrl)}
    <p>Hi ${data.clientName},</p>
    <p>You have received a new invoice for <strong>${formattedTotal}</strong>.</p>
    ${buildInvoiceDetailsBlock(formattedTotal, formattedDueDate, data.paymentReference, periodHtml)}
    ${buildLineItemsTable(data.items, data.currency, data.itemGroups)}
    ${messageHtml}
    <p>${buildEmailButton(invoiceUrl, "View Invoice", color)}</p>
    <p style="color: #666; font-size: 14px; margin-top: 30px;">
      If you have any questions about this invoice, please reply to this email or contact ${data.senderName} directly.
    </p>
    ${buildEmailFooter(data.senderName, data.branding.companyAddress, data.branding.footerText)}`;

  const periodText =
    data.periodStart && data.periodEnd
      ? `Billing Period: ${formatDate(data.periodStart)} — ${formatDate(data.periodEnd)}\n`
      : "";
  const itemsText = buildPlainTextItems(data.items, data.itemGroups, data.currency);
  const referenceText = data.paymentReference ? `Reference: ${data.paymentReference}\n` : "";
  const messageText = data.message ? `\nMessage:\n${data.message}\n` : "";

  const text = `${title}\n\nHi ${data.clientName},\n\nYou have received a new invoice for ${formattedTotal}.\n\nAmount Due: ${formattedTotal}\nDue Date: ${formattedDueDate}\n${periodText}${referenceText}\nLine Items:\n${itemsText}\n${messageText}\nView Invoice: ${invoiceUrl}\n\nIf you have any questions about this invoice, please reply to this email or contact ${data.senderName} directly.`;

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

  const periodHtml =
    data.periodStart && data.periodEnd
      ? `<p style="margin: 10px 0 0;"><strong>Billing Period:</strong> ${formatDate(data.periodStart)} — ${formatDate(data.periodEnd)}</p>`
      : "";

  const bodyHtml = `
    ${buildBrandingHeader(data.branding.logoUrl)}
    <p>Hi ${data.clientName},</p>
    <p>This is a friendly reminder about an outstanding invoice for <strong>${formattedTotal}</strong>.</p>
    ${data.isOverdue ? `<p style="color: ${EMAIL.OVERDUE_COLOR};"><strong>This invoice is now overdue.</strong></p>` : ""}
    ${buildInvoiceDetailsBlock(formattedTotal, formattedDueDate, data.paymentReference, periodHtml)}
    ${buildLineItemsTable(data.items, data.currency, data.itemGroups)}
    <p>${buildEmailButton(invoiceUrl, "View & Pay Invoice", color)}</p>
    <p style="color: #666; font-size: 14px; margin-top: 30px;">
      If you have already paid this invoice, please disregard this reminder. For any questions, please contact ${data.senderName} directly.
    </p>
    ${buildEmailFooter(data.senderName, data.branding.companyAddress, data.branding.footerText)}`;

  const periodText =
    data.periodStart && data.periodEnd
      ? `Billing Period: ${formatDate(data.periodStart)} — ${formatDate(data.periodEnd)}\n`
      : "";
  const itemsText = buildPlainTextItems(data.items, data.itemGroups, data.currency);
  const referenceText = data.paymentReference ? `Reference: ${data.paymentReference}\n` : "";

  const text = `${title}\n\nHi ${data.clientName},\n\nThis is a friendly reminder about an outstanding invoice for ${formattedTotal}.\n\n${data.isOverdue ? "This invoice is now overdue.\n\n" : ""}Amount Due: ${formattedTotal}\nDue Date: ${formattedDueDate}\n${periodText}${referenceText}\nLine Items:\n${itemsText}\n\nView & Pay Invoice: ${invoiceUrl}\n\nIf you have already paid this invoice, please disregard this reminder. For any questions, please contact ${data.senderName} directly.`;

  return getResend().emails.send({
    from: env.EMAIL_FROM,
    to: data.clientEmail,
    replyTo: data.senderEmail,
    subject: title,
    html: buildEmailLayout(title, color, bodyHtml, data.branding.fontFamily),
    text,
  });
}

const WAITLIST_COLOR = "#0d9488";

export async function sendWaitlistConfirmationEmail(email: string) {
  const title = `You're on the ${SEO.SITE_NAME} waitlist!`;

  const bodyHtml = `
    <p>Hi there,</p>
    <p>Thanks for your interest in <strong>${SEO.SITE_NAME}</strong>! We've added you to our waitlist.</p>
    <p>We'll notify you as soon as your account is ready.</p>
    <p>${buildEmailButton(SEO.SITE_URL, `Visit ${SEO.SITE_NAME}`, WAITLIST_COLOR)}</p>`;

  const text = `${title}\n\nThanks for your interest in ${SEO.SITE_NAME}! We've added you to our waitlist.\n\nWe'll notify you as soon as your account is ready.\n\nVisit ${SEO.SITE_NAME}: ${SEO.SITE_URL}`;

  return getResend().emails.send({
    from: env.EMAIL_FROM,
    to: email,
    subject: title,
    html: buildEmailLayout(title, WAITLIST_COLOR, bodyHtml),
    text,
  });
}

export async function sendWaitlistNotificationEmail(email: string) {
  const title = "New waitlist signup";

  const bodyHtml = `
    <p>A new user has joined the waitlist:</p>
    <p><strong>${email}</strong></p>`;

  const text = `New waitlist signup: ${email}`;

  if (!env.ADMIN_EMAIL) {
    return;
  }

  return getResend().emails.send({
    from: env.EMAIL_FROM,
    to: env.ADMIN_EMAIL,
    subject: `[${SEO.SITE_NAME}] ${title}: ${email}`,
    html: buildEmailLayout(title, WAITLIST_COLOR, bodyHtml),
    text,
  });
}

export async function sendWaitlistApprovalEmail(email: string) {
  const title = `You've been approved for ${SEO.SITE_NAME}!`;
  const signUpUrl = `${env.APP_URL}/auth/sign-up`;

  const bodyHtml = `
    <p>Hi there,</p>
    <p>Great news — your access to <strong>${SEO.SITE_NAME}</strong> has been approved!</p>
    <p>Click the button below to create your account:</p>
    <p>${buildEmailButton(signUpUrl, "Create Your Account", WAITLIST_COLOR)}</p>`;

  const text = `${title}\n\nGreat news — your access to ${SEO.SITE_NAME} has been approved!\n\nCreate your account: ${signUpUrl}`;

  return getResend().emails.send({
    from: env.EMAIL_FROM,
    to: email,
    subject: title,
    html: buildEmailLayout(title, WAITLIST_COLOR, bodyHtml),
    text,
  });
}
