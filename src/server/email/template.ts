import { EMAIL, FONT_FAMILY_MAP } from "@app/shared/config/config";
import { formatCurrency } from "@app/shared/lib/format";

export interface EmailLineItem {
  title: string;
  description?: string | null;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface EmailItemGroup {
  title: string;
  items: EmailLineItem[];
}

export function buildBrandingHeader(logoUrl: string | null): string {
  return logoUrl ? buildLogoBlock(logoUrl) : "";
}

function formatItemLine(item: EmailLineItem, currency: string): string {
  return `  ${item.title} — ${item.quantity} × ${formatCurrency(item.unitPrice, currency)} = ${formatCurrency(item.amount, currency)}`;
}

export function buildPlainTextItems(
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

export function buildEmailButton(url: string, label: string, color: string) {
  return `<a href="${url}" style="display: inline-block; background: ${color}; color: white; padding: ${EMAIL.BUTTON_PADDING}; text-decoration: none; border-radius: ${EMAIL.BUTTON_BORDER_RADIUS}; font-weight: 500;">${label}</a>`;
}

export function buildInvoiceDetailsBlock(
  formattedTotal: string,
  formattedDueDate: string,
  paymentReference: string | null
) {
  const referenceRow = paymentReference
    ? `<p style="margin: 10px 0 0;"><strong>Reference:</strong> ${paymentReference}</p>`
    : "";

  return `<div style="background: white; padding: 20px; border-radius: 4px; margin: 20px 0;">
      <p style="margin: 0;"><strong>Amount Due:</strong> ${formattedTotal}</p>
      <p style="margin: 10px 0 0;"><strong>Due Date:</strong> ${formattedDueDate}</p>
      ${referenceRow}
    </div>`;
}

function buildItemRow(item: EmailLineItem, currency: string, indent = false) {
  const paddingLeft = indent ? "24px" : "12px";

  return `<tr>
    <td style="padding: 8px 12px 8px ${paddingLeft}; border-bottom: 1px solid #eee;">${item.title}</td>
    <td style="padding: 8px 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
    <td style="padding: 8px 12px; border-bottom: 1px solid #eee; text-align: right; white-space: nowrap;">${formatCurrency(item.unitPrice, currency)}</td>
    <td style="padding: 8px 12px; border-bottom: 1px solid #eee; text-align: right; white-space: nowrap;">${formatCurrency(item.amount, currency)}</td>
  </tr>`;
}

export function buildLineItemsTable(
  items: EmailLineItem[],
  currency: string,
  itemGroups?: EmailItemGroup[]
) {
  let rows = "";

  if (itemGroups?.length) {
    for (const group of itemGroups) {
      const groupTotal = group.items.reduce((sum, item) => sum + item.amount, 0);

      rows += `<tr style="background: #f5f5f5;">
        <td colspan="3" style="padding: 8px 12px; font-weight: 600; border-bottom: 1px solid #eee;">${group.title}</td>
        <td style="padding: 8px 12px; font-weight: 600; border-bottom: 1px solid #eee; text-align: right; white-space: nowrap;">${formatCurrency(groupTotal, currency)}</td>
      </tr>`;
      rows += group.items.map((item) => buildItemRow(item, currency, true)).join("");
    }
  }

  rows += items.map((item) => buildItemRow(item, currency)).join("");

  return `<table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: white; border-radius: 4px; overflow: hidden;">
    <thead>
      <tr style="background: #f9f9f9;">
        <th style="padding: 10px 12px; text-align: left; font-weight: 600; font-size: 13px; color: #666; border-bottom: 2px solid #eee;">Item</th>
        <th style="padding: 10px 12px; text-align: center; font-weight: 600; font-size: 13px; color: #666; border-bottom: 2px solid #eee;">Qty</th>
        <th style="padding: 10px 12px; text-align: right; font-weight: 600; font-size: 13px; color: #666; border-bottom: 2px solid #eee; white-space: nowrap;">Unit Price</th>
        <th style="padding: 10px 12px; text-align: right; font-weight: 600; font-size: 13px; color: #666; border-bottom: 2px solid #eee; white-space: nowrap;">Amount</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
}

export function buildEmailFooter(
  senderName: string,
  companyAddress: string | null,
  footerText: string | null
) {
  const parts: string[] = [];

  if (footerText) {
    parts.push(`<p style="margin: 0 0 8px; white-space: pre-line;">${footerText}</p>`);
  }

  if (companyAddress) {
    parts.push(
      `<p style="margin: 0; color: #999; font-size: 12px; white-space: pre-line;">${senderName}<br>${companyAddress}</p>`
    );
  }

  if (parts.length === 0) {
    return "";
  }

  return `<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 13px;">
    ${parts.join("")}
  </div>`;
}

function buildLogoBlock(logoUrl: string) {
  return `<img src="${logoUrl}" alt="Company logo" style="max-width: 200px; max-height: 60px; margin-bottom: 16px; display: block;" />`;
}

export function buildEmailLayout(
  title: string,
  primaryColor: string,
  bodyHtml: string,
  fontFamily?: string | null
) {
  const fontStack = (fontFamily && FONT_FAMILY_MAP[fontFamily]) || FONT_FAMILY_MAP.system;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="font-family: ${fontStack}; line-height: 1.6; color: #333; max-width: ${EMAIL.MAX_WIDTH}px; margin: 0 auto; padding: 20px;">
  <div style="background: #f5f5f5; padding: 30px; border-radius: 8px;">
    <h1 style="margin: 0 0 20px; color: ${primaryColor};">${title}</h1>
    ${bodyHtml}
  </div>
</body>
</html>`;
}
