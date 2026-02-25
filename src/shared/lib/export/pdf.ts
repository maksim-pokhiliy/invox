import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import { DISCOUNT_TYPE, type DiscountTypeValue } from "@app/shared/config/invoice-status";
import { formatCurrency, formatDate } from "@app/shared/lib/format";
import type { InvoiceItemGroupResponse, InvoiceItemResponse } from "@app/shared/schemas/api";

import { LAYOUT, PDF_COLORS, STATUS_COLORS } from "./pdf-constants";

interface InvoicePdfData {
  publicId: string;
  status: string;
  currency: string;
  subtotal: number;
  discountType?: DiscountTypeValue | null;
  discountValue?: number;
  discountAmount?: number;
  taxRate?: number;
  taxAmount?: number;
  total: number;
  dueDate: string;
  createdAt: string;
  paidAt?: string | null;
  periodStart?: string | null;
  periodEnd?: string | null;
  notes?: string | null;
  message?: string | null;
  client: { name: string; email: string };
  sender?: {
    companyName?: string | null;
    displayName?: string | null;
    email?: string | null;
    address?: string | null;
  } | null;
  items: InvoiceItemResponse[];
  itemGroups?: InvoiceItemGroupResponse[];
}

function renderHeader(doc: jsPDF, invoice: InvoicePdfData): void {
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(LAYOUT.HEADER_TITLE_SIZE);
  doc.setTextColor(...PDF_COLORS.primary);
  doc.text("INVOICE", LAYOUT.MARGIN, LAYOUT.HEADER_TITLE_Y);

  doc.setFontSize(LAYOUT.HEADER_ID_SIZE);
  doc.setTextColor(...PDF_COLORS.muted);
  doc.text(`#${invoice.publicId}`, LAYOUT.MARGIN, LAYOUT.HEADER_ID_Y);

  const statusColor = STATUS_COLORS[invoice.status] || STATUS_COLORS.DRAFT;
  const badgeX = pageWidth - LAYOUT.MARGIN - LAYOUT.STATUS_BADGE_WIDTH;

  doc.setFillColor(...statusColor);
  doc.roundedRect(
    badgeX,
    LAYOUT.STATUS_BADGE_Y,
    LAYOUT.STATUS_BADGE_WIDTH,
    LAYOUT.STATUS_BADGE_HEIGHT,
    LAYOUT.STATUS_BADGE_RADIUS,
    LAYOUT.STATUS_BADGE_RADIUS,
    "F"
  );
  doc.setFontSize(LAYOUT.STATUS_FONT_SIZE);
  doc.setTextColor(...PDF_COLORS.white);
  doc.text(
    invoice.status,
    badgeX + LAYOUT.STATUS_BADGE_WIDTH / 2,
    LAYOUT.STATUS_BADGE_Y + LAYOUT.STATUS_TEXT_OFFSET_Y,
    { align: "center" }
  );
}

function renderSenderInfo(doc: jsPDF, invoice: InvoicePdfData): number {
  let yPos = LAYOUT.INFO_START_Y;

  doc.setFontSize(LAYOUT.SECTION_LABEL_SIZE);
  doc.setTextColor(...PDF_COLORS.muted);
  doc.text("FROM", LAYOUT.MARGIN, yPos);

  doc.setFontSize(LAYOUT.INFO_FONT_SIZE);
  doc.setTextColor(...PDF_COLORS.text);
  yPos += LAYOUT.INFO_LABEL_OFFSET;

  if (invoice.sender?.companyName) {
    doc.setFont("helvetica", "bold");
    doc.text(invoice.sender.companyName, LAYOUT.MARGIN, yPos);
    yPos += LAYOUT.INFO_LINE_HEIGHT;
  }

  doc.setFont("helvetica", "normal");

  if (invoice.sender?.displayName) {
    doc.text(invoice.sender.displayName, LAYOUT.MARGIN, yPos);
    yPos += LAYOUT.INFO_LINE_HEIGHT;
  }

  if (invoice.sender?.email) {
    doc.text(invoice.sender.email, LAYOUT.MARGIN, yPos);
    yPos += LAYOUT.INFO_LINE_HEIGHT;
  }

  if (invoice.sender?.address) {
    invoice.sender.address.split("\n").forEach((line) => {
      doc.text(line, LAYOUT.MARGIN, yPos);
      yPos += LAYOUT.INFO_LINE_HEIGHT;
    });
  }

  return yPos;
}

function renderClientInfo(doc: jsPDF, invoice: InvoicePdfData): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const clientX = pageWidth / 2 + LAYOUT.SECTION_LABEL_SIZE;
  let yPos = LAYOUT.INFO_START_Y;

  doc.setFontSize(LAYOUT.SECTION_LABEL_SIZE);
  doc.setTextColor(...PDF_COLORS.muted);
  doc.text("BILL TO", clientX, yPos);

  doc.setFontSize(LAYOUT.INFO_FONT_SIZE);
  doc.setTextColor(...PDF_COLORS.text);
  yPos += LAYOUT.INFO_LABEL_OFFSET;
  doc.setFont("helvetica", "bold");
  doc.text(invoice.client.name, clientX, yPos);
  yPos += LAYOUT.INFO_LINE_HEIGHT;
  doc.setFont("helvetica", "normal");
  doc.text(invoice.client.email, clientX, yPos);
}

function renderDates(doc: jsPDF, invoice: InvoicePdfData): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const hasPeriod = invoice.periodStart && invoice.periodEnd;
  const rowCount = hasPeriod ? 2 : 1;
  const blockHeight = LAYOUT.DATES_HEIGHT + (rowCount > 1 ? 18 : 0);
  const yPos = LAYOUT.DATES_Y;

  doc.setFillColor(...PDF_COLORS.background);
  doc.roundedRect(
    LAYOUT.MARGIN,
    yPos - LAYOUT.INFO_LINE_HEIGHT,
    pageWidth - LAYOUT.MARGIN * 2,
    blockHeight,
    LAYOUT.DATES_RADIUS,
    LAYOUT.DATES_RADIUS,
    "F"
  );

  doc.setFontSize(LAYOUT.DATES_LABEL_SIZE);
  doc.setTextColor(...PDF_COLORS.muted);
  doc.text("INVOICE DATE", LAYOUT.DATES_COL_1, yPos + LAYOUT.DATES_LABEL_OFFSET);
  doc.text("DUE DATE", LAYOUT.DATES_COL_2, yPos + LAYOUT.DATES_LABEL_OFFSET);

  if (invoice.paidAt) {
    doc.text("PAID DATE", LAYOUT.DATES_COL_3, yPos + LAYOUT.DATES_LABEL_OFFSET);
  }

  doc.setFontSize(LAYOUT.DATES_VALUE_SIZE);
  doc.setTextColor(...PDF_COLORS.text);
  doc.text(formatDate(invoice.createdAt), LAYOUT.DATES_COL_1, yPos + LAYOUT.DATES_VALUE_OFFSET);
  doc.text(formatDate(invoice.dueDate), LAYOUT.DATES_COL_2, yPos + LAYOUT.DATES_VALUE_OFFSET);

  if (invoice.paidAt) {
    doc.text(formatDate(invoice.paidAt), LAYOUT.DATES_COL_3, yPos + LAYOUT.DATES_VALUE_OFFSET);
  }

  if (hasPeriod && invoice.periodStart && invoice.periodEnd) {
    const periodY = yPos + 18;

    doc.setFontSize(LAYOUT.DATES_LABEL_SIZE);
    doc.setTextColor(...PDF_COLORS.muted);
    doc.text("BILLING PERIOD", LAYOUT.DATES_COL_1, periodY + LAYOUT.DATES_LABEL_OFFSET);
    doc.setFontSize(LAYOUT.DATES_VALUE_SIZE);
    doc.setTextColor(...PDF_COLORS.text);
    doc.text(
      `${formatDate(invoice.periodStart)} — ${formatDate(invoice.periodEnd)}`,
      LAYOUT.DATES_COL_1,
      periodY + LAYOUT.DATES_VALUE_OFFSET
    );
  }
}

function buildItemRow(item: InvoiceItemResponse, currency: string, indent = false): string[] {
  return [
    indent ? `    ${item.title}` : item.title,
    item.quantity.toString(),
    formatCurrency(item.unitPrice, currency),
    formatCurrency(item.amount, currency),
  ];
}

function renderItemsTable(doc: jsPDF, invoice: InvoicePdfData, yOffset = 0): number {
  const tableData: string[][] = [];

  invoice.itemGroups?.forEach((group) => {
    const groupTotal = group.items.reduce((sum, item) => sum + item.amount, 0);

    tableData.push([group.title, "", "", formatCurrency(groupTotal, invoice.currency)]);
    group.items.forEach((item) => {
      tableData.push(buildItemRow(item, invoice.currency, true));
    });
  });

  invoice.items.forEach((item) => {
    tableData.push(buildItemRow(item, invoice.currency));
  });

  autoTable(doc, {
    startY: LAYOUT.TABLE_START_Y + yOffset,
    head: [["Item", "Qty", "Unit Price", "Amount"]],
    body: tableData,
    theme: "plain",
    headStyles: {
      fillColor: PDF_COLORS.background,
      textColor: PDF_COLORS.text,
      fontStyle: "bold",
      fontSize: LAYOUT.TABLE_HEAD_SIZE,
    },
    bodyStyles: { textColor: PDF_COLORS.text, fontSize: LAYOUT.TABLE_BODY_SIZE },
    columnStyles: {
      0: { cellWidth: LAYOUT.TABLE_COL_ITEM },
      1: { cellWidth: LAYOUT.TABLE_COL_QTY, halign: "right" },
      2: { cellWidth: LAYOUT.TABLE_COL_PRICE, halign: "right" },
      3: { cellWidth: LAYOUT.TABLE_COL_AMOUNT, halign: "right" },
    },
    margin: { left: LAYOUT.MARGIN, right: LAYOUT.MARGIN },
  });

  return (doc.lastAutoTable.finalY ?? LAYOUT.TABLE_START_Y) + LAYOUT.TABLE_END_GAP;
}

function renderTotals(doc: jsPDF, invoice: InvoicePdfData, startY: number): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const totalsX = pageWidth - LAYOUT.TOTALS_OFFSET_X;
  let yPos = startY;

  doc.setFontSize(LAYOUT.TOTALS_FONT_SIZE);
  doc.setTextColor(...PDF_COLORS.muted);
  doc.text("Subtotal", totalsX, yPos);
  doc.setTextColor(...PDF_COLORS.text);
  doc.text(
    formatCurrency(invoice.subtotal, invoice.currency),
    totalsX + LAYOUT.TOTALS_WIDTH,
    yPos,
    { align: "right" }
  );
  yPos += LAYOUT.TOTALS_LINE_HEIGHT;

  if (invoice.discountAmount && invoice.discountAmount > 0) {
    doc.setTextColor(...PDF_COLORS.muted);
    const discountLabel =
      invoice.discountType === DISCOUNT_TYPE.PERCENTAGE
        ? `Discount (${invoice.discountValue}%)`
        : "Discount";

    doc.text(discountLabel, totalsX, yPos);
    doc.setTextColor(...PDF_COLORS.error);
    doc.text(
      `-${formatCurrency(invoice.discountAmount, invoice.currency)}`,
      totalsX + LAYOUT.TOTALS_WIDTH,
      yPos,
      { align: "right" }
    );
    yPos += LAYOUT.TOTALS_LINE_HEIGHT;
  }

  if (invoice.taxAmount && invoice.taxAmount > 0) {
    doc.setTextColor(...PDF_COLORS.muted);
    doc.text(`Tax (${invoice.taxRate}%)`, totalsX, yPos);
    doc.setTextColor(...PDF_COLORS.text);
    doc.text(
      formatCurrency(invoice.taxAmount, invoice.currency),
      totalsX + LAYOUT.TOTALS_WIDTH,
      yPos,
      { align: "right" }
    );
    yPos += LAYOUT.TOTALS_LINE_HEIGHT;
  }

  doc.setDrawColor(...PDF_COLORS.divider);
  doc.line(totalsX, yPos, totalsX + LAYOUT.TOTALS_WIDTH, yPos);
  yPos += LAYOUT.TOTALS_SEPARATOR_GAP;

  doc.setFontSize(LAYOUT.TOTALS_TOTAL_SIZE);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...PDF_COLORS.text);
  doc.text("Total", totalsX, yPos);
  doc.setTextColor(...PDF_COLORS.primary);
  doc.text(formatCurrency(invoice.total, invoice.currency), totalsX + LAYOUT.TOTALS_WIDTH, yPos, {
    align: "right",
  });

  return yPos;
}

function renderMessage(doc: jsPDF, invoice: InvoicePdfData, startY: number): void {
  if (!invoice.message) {
    return;
  }

  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = startY + LAYOUT.NOTES_GAP;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(LAYOUT.NOTES_LABEL_SIZE);
  doc.setTextColor(...PDF_COLORS.muted);
  doc.text("Message", LAYOUT.MARGIN, yPos);
  yPos += LAYOUT.NOTES_LABEL_OFFSET;
  doc.setFontSize(LAYOUT.NOTES_BODY_SIZE);
  doc.setTextColor(...PDF_COLORS.text);
  const messageLines = doc.splitTextToSize(invoice.message, pageWidth - LAYOUT.MARGIN * 2);

  doc.text(messageLines, LAYOUT.MARGIN, yPos);
}

function renderFooter(doc: jsPDF): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const footerY = doc.internal.pageSize.getHeight() - LAYOUT.FOOTER_OFFSET_Y;

  doc.setFontSize(LAYOUT.FOOTER_FONT_SIZE);
  doc.setTextColor(...PDF_COLORS.muted);
  doc.text("Generated with GetPaid — getpaid.dev", pageWidth / 2, footerY, { align: "center" });
}

export function generateInvoicePdf(invoice: InvoicePdfData): void {
  const doc = new jsPDF();

  renderHeader(doc, invoice);
  renderSenderInfo(doc, invoice);
  renderClientInfo(doc, invoice);
  renderDates(doc, invoice);
  const hasPeriod = invoice.periodStart && invoice.periodEnd;
  const tableStartOffset = hasPeriod ? 18 : 0;
  const tableEndY = renderItemsTable(doc, invoice, tableStartOffset);
  const totalsEndY = renderTotals(doc, invoice, tableEndY);

  renderMessage(doc, invoice, totalsEndY);
  renderFooter(doc);

  doc.save(`invoice-${invoice.publicId}.pdf`);
}
