import { EMAIL } from "@app/shared/config/config";

export function buildEmailButton(url: string, label: string, color: string) {
  return `<a href="${url}" style="display: inline-block; background: ${color}; color: white; padding: ${EMAIL.BUTTON_PADDING}; text-decoration: none; border-radius: ${EMAIL.BUTTON_BORDER_RADIUS}; font-weight: 500;">${label}</a>`;
}

export function buildInvoiceDetailsBlock(formattedTotal: string, formattedDueDate: string) {
  return `<div style="background: white; padding: 20px; border-radius: 4px; margin: 20px 0;">
      <p style="margin: 0;"><strong>Amount Due:</strong> ${formattedTotal}</p>
      <p style="margin: 10px 0 0;"><strong>Due Date:</strong> ${formattedDueDate}</p>
    </div>`;
}

export function buildEmailLayout(title: string, primaryColor: string, bodyHtml: string) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: ${EMAIL.MAX_WIDTH}px; margin: 0 auto; padding: 20px;">
  <div style="background: #f5f5f5; padding: 30px; border-radius: 8px;">
    <h1 style="margin: 0 0 20px; color: ${primaryColor};">${title}</h1>
    ${bodyHtml}
  </div>
</body>
</html>`;
}
