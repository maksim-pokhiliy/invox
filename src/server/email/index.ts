import { Resend } from "resend";
import { formatCurrency, formatDate } from "@app/lib/format";

const resend = new Resend(process.env.RESEND_API_KEY);

const APP_URL = process.env.APP_URL || "http://localhost:3000";
const EMAIL_FROM = process.env.EMAIL_FROM || "invoices@example.com";

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

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice from ${data.senderName}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f5f5f5; padding: 30px; border-radius: 8px;">
    <h1 style="margin: 0 0 20px; color: #1976d2;">Invoice from ${data.senderName}</h1>

    <p>Hi ${data.clientName},</p>

    <p>You have received a new invoice for <strong>${formattedTotal}</strong>.</p>

    <div style="background: white; padding: 20px; border-radius: 4px; margin: 20px 0;">
      <p style="margin: 0;"><strong>Amount Due:</strong> ${formattedTotal}</p>
      <p style="margin: 10px 0 0;"><strong>Due Date:</strong> ${formattedDueDate}</p>
    </div>

    <p>
      <a href="${invoiceUrl}" style="display: inline-block; background: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: 500;">View Invoice</a>
    </p>

    <p style="color: #666; font-size: 14px; margin-top: 30px;">
      If you have any questions about this invoice, please reply to this email or contact ${data.senderName} directly.
    </p>
  </div>
</body>
</html>
`;

  const text = `
Invoice from ${data.senderName}

Hi ${data.clientName},

You have received a new invoice for ${formattedTotal}.

Amount Due: ${formattedTotal}
Due Date: ${formattedDueDate}

View Invoice: ${invoiceUrl}

If you have any questions about this invoice, please reply to this email or contact ${data.senderName} directly.
`;

  const result = await resend.emails.send({
    from: EMAIL_FROM,
    to: data.clientEmail,
    replyTo: data.senderEmail,
    subject: `Invoice from ${data.senderName} - ${formattedTotal}`,
    html,
    text,
  });

  return result;
}

export async function sendReminderEmail(data: InvoiceEmailData & { isOverdue: boolean }) {
  const invoiceUrl = `${APP_URL}/i/${data.publicId}`;
  const formattedTotal = formatCurrency(data.total, data.currency);
  const formattedDueDate = formatDate(data.dueDate);
  const subject = data.isOverdue
    ? `Overdue Invoice Reminder from ${data.senderName}`
    : `Invoice Reminder from ${data.senderName}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f5f5f5; padding: 30px; border-radius: 8px;">
    <h1 style="margin: 0 0 20px; color: ${data.isOverdue ? "#d32f2f" : "#1976d2"};">
      ${data.isOverdue ? "Overdue Invoice Reminder" : "Invoice Reminder"}
    </h1>

    <p>Hi ${data.clientName},</p>

    <p>This is a friendly reminder about an outstanding invoice for <strong>${formattedTotal}</strong>.</p>

    ${data.isOverdue ? '<p style="color: #d32f2f;"><strong>This invoice is now overdue.</strong></p>' : ""}

    <div style="background: white; padding: 20px; border-radius: 4px; margin: 20px 0;">
      <p style="margin: 0;"><strong>Amount Due:</strong> ${formattedTotal}</p>
      <p style="margin: 10px 0 0;"><strong>Due Date:</strong> ${formattedDueDate}</p>
    </div>

    <p>
      <a href="${invoiceUrl}" style="display: inline-block; background: ${data.isOverdue ? "#d32f2f" : "#1976d2"}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: 500;">View & Pay Invoice</a>
    </p>

    <p style="color: #666; font-size: 14px; margin-top: 30px;">
      If you have already paid this invoice, please disregard this reminder. For any questions, please contact ${data.senderName} directly.
    </p>
  </div>
</body>
</html>
`;

  const text = `
${data.isOverdue ? "Overdue Invoice Reminder" : "Invoice Reminder"}

Hi ${data.clientName},

This is a friendly reminder about an outstanding invoice for ${formattedTotal}.

${data.isOverdue ? "This invoice is now overdue.\n" : ""}
Amount Due: ${formattedTotal}
Due Date: ${formattedDueDate}

View & Pay Invoice: ${invoiceUrl}

If you have already paid this invoice, please disregard this reminder. For any questions, please contact ${data.senderName} directly.
`;

  const result = await resend.emails.send({
    from: EMAIL_FROM,
    to: data.clientEmail,
    replyTo: data.senderEmail,
    subject,
    html,
    text,
  });

  return result;
}
