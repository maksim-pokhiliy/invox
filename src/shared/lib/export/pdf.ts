import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import { formatCurrency, formatDate } from "@app/shared/lib/format";

type RGB = [number, number, number];

const PDF_COLORS = {
  primary: [79, 70, 229] as RGB,
  text: [31, 41, 55] as RGB,
  muted: [107, 114, 128] as RGB,
  white: [255, 255, 255] as RGB,
  background: [249, 250, 251] as RGB,
  success: [34, 197, 94] as RGB,
  error: [239, 68, 68] as RGB,
  info: [59, 130, 246] as RGB,
  gray: [156, 163, 175] as RGB,
};

const STATUS_COLORS: Record<string, RGB> = {
  PAID: PDF_COLORS.success,
  OVERDUE: PDF_COLORS.error,
  SENT: PDF_COLORS.info,
  VIEWED: PDF_COLORS.info,
  DRAFT: PDF_COLORS.gray,
};

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface InvoicePdfData {
  publicId: string;
  status: string;
  currency: string;
  subtotal: number;
  discountType?: string | null;
  discountValue?: number;
  discountAmount?: number;
  taxRate?: number;
  taxAmount?: number;
  total: number;
  dueDate: string;
  createdAt: string;
  paidAt?: string | null;
  notes?: string | null;
  client: { name: string; email: string };
  sender?: {
    companyName?: string | null;
    displayName?: string | null;
    email?: string | null;
    address?: string | null;
  } | null;
  items: InvoiceItem[];
}

function renderHeader(doc: jsPDF, invoice: InvoicePdfData): void {
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(28);
  doc.setTextColor(...PDF_COLORS.primary);
  doc.text("INVOICE", 20, 30);

  doc.setFontSize(12);
  doc.setTextColor(...PDF_COLORS.muted);
  doc.text(`#${invoice.publicId}`, 20, 38);

  const statusColor = STATUS_COLORS[invoice.status] || STATUS_COLORS.DRAFT;

  doc.setFillColor(...statusColor);
  doc.roundedRect(pageWidth - 50, 22, 30, 10, 2, 2, "F");
  doc.setFontSize(8);
  doc.setTextColor(...PDF_COLORS.white);
  doc.text(invoice.status, pageWidth - 35, 29, { align: "center" });
}

function renderSenderInfo(doc: jsPDF, invoice: InvoicePdfData): number {
  let yPos = 55;

  doc.setFontSize(10);
  doc.setTextColor(...PDF_COLORS.muted);
  doc.text("FROM", 20, yPos);

  doc.setFontSize(11);
  doc.setTextColor(...PDF_COLORS.text);
  yPos += 7;

  if (invoice.sender?.companyName) {
    doc.setFont("helvetica", "bold");
    doc.text(invoice.sender.companyName, 20, yPos);
    yPos += 5;
  }

  doc.setFont("helvetica", "normal");

  if (invoice.sender?.displayName) {
    doc.text(invoice.sender.displayName, 20, yPos);
    yPos += 5;
  }

  if (invoice.sender?.email) {
    doc.text(invoice.sender.email, 20, yPos);
    yPos += 5;
  }

  if (invoice.sender?.address) {
    invoice.sender.address.split("\n").forEach((line) => {
      doc.text(line, 20, yPos);
      yPos += 5;
    });
  }

  return yPos;
}

function renderClientInfo(doc: jsPDF, invoice: InvoicePdfData): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 55;

  doc.setFontSize(10);
  doc.setTextColor(...PDF_COLORS.muted);
  doc.text("BILL TO", pageWidth / 2 + 10, yPos);

  doc.setFontSize(11);
  doc.setTextColor(...PDF_COLORS.text);
  yPos += 7;
  doc.setFont("helvetica", "bold");
  doc.text(invoice.client.name, pageWidth / 2 + 10, yPos);
  yPos += 5;
  doc.setFont("helvetica", "normal");
  doc.text(invoice.client.email, pageWidth / 2 + 10, yPos);
}

function renderDates(doc: jsPDF, invoice: InvoicePdfData): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const yPos = 100;

  doc.setFillColor(...PDF_COLORS.background);
  doc.roundedRect(20, yPos - 5, pageWidth - 40, 25, 3, 3, "F");

  doc.setFontSize(9);
  doc.setTextColor(...PDF_COLORS.muted);
  doc.text("INVOICE DATE", 30, yPos + 3);
  doc.text("DUE DATE", 90, yPos + 3);

  if (invoice.paidAt) {
    doc.text("PAID DATE", 150, yPos + 3);
  }

  doc.setFontSize(10);
  doc.setTextColor(...PDF_COLORS.text);
  doc.text(formatDate(invoice.createdAt), 30, yPos + 12);
  doc.text(formatDate(invoice.dueDate), 90, yPos + 12);

  if (invoice.paidAt) {
    doc.text(formatDate(invoice.paidAt), 150, yPos + 12);
  }
}

function renderItemsTable(doc: jsPDF, invoice: InvoicePdfData): number {
  const tableData = invoice.items.map((item) => [
    item.description,
    item.quantity.toString(),
    formatCurrency(item.unitPrice, invoice.currency),
    formatCurrency(item.amount, invoice.currency),
  ]);

  autoTable(doc, {
    startY: 135,
    head: [["Description", "Qty", "Unit Price", "Amount"]],
    body: tableData,
    theme: "plain",
    headStyles: {
      fillColor: PDF_COLORS.background,
      textColor: PDF_COLORS.text,
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: { textColor: PDF_COLORS.text, fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 25, halign: "right" },
      2: { cellWidth: 40, halign: "right" },
      3: { cellWidth: 40, halign: "right" },
    },
    margin: { left: 20, right: 20 },
  });

  return (doc.lastAutoTable.finalY ?? 135) + 15;
}

function renderTotals(doc: jsPDF, invoice: InvoicePdfData, startY: number): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const totalsX = pageWidth - 90;
  const totalsWidth = 70;
  let yPos = startY;

  doc.setFontSize(10);
  doc.setTextColor(...PDF_COLORS.muted);
  doc.text("Subtotal", totalsX, yPos);
  doc.setTextColor(...PDF_COLORS.text);
  doc.text(formatCurrency(invoice.subtotal, invoice.currency), totalsX + totalsWidth, yPos, {
    align: "right",
  });
  yPos += 8;

  if (invoice.discountAmount && invoice.discountAmount > 0) {
    doc.setTextColor(...PDF_COLORS.muted);
    const discountLabel =
      invoice.discountType === "PERCENTAGE" ? `Discount (${invoice.discountValue}%)` : "Discount";

    doc.text(discountLabel, totalsX, yPos);
    doc.setTextColor(...PDF_COLORS.error);
    doc.text(
      `-${formatCurrency(invoice.discountAmount, invoice.currency)}`,
      totalsX + totalsWidth,
      yPos,
      {
        align: "right",
      }
    );
    yPos += 8;
  }

  if (invoice.taxAmount && invoice.taxAmount > 0) {
    doc.setTextColor(...PDF_COLORS.muted);
    doc.text(`Tax (${invoice.taxRate}%)`, totalsX, yPos);
    doc.setTextColor(...PDF_COLORS.text);
    doc.text(formatCurrency(invoice.taxAmount, invoice.currency), totalsX + totalsWidth, yPos, {
      align: "right",
    });
    yPos += 8;
  }

  doc.setDrawColor(229, 231, 235);
  doc.line(totalsX, yPos, totalsX + totalsWidth, yPos);
  yPos += 10;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...PDF_COLORS.text);
  doc.text("Total", totalsX, yPos);
  doc.setTextColor(...PDF_COLORS.primary);
  doc.text(formatCurrency(invoice.total, invoice.currency), totalsX + totalsWidth, yPos, {
    align: "right",
  });

  return yPos;
}

function renderNotes(doc: jsPDF, invoice: InvoicePdfData, startY: number): void {
  if (!invoice.notes) {
    return;
  }

  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = startY + 25;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...PDF_COLORS.muted);
  doc.text("Notes", 20, yPos);
  yPos += 6;
  doc.setFontSize(10);
  doc.setTextColor(...PDF_COLORS.text);
  const noteLines = doc.splitTextToSize(invoice.notes, pageWidth - 40);

  doc.text(noteLines, 20, yPos);
}

function renderFooter(doc: jsPDF): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const footerY = doc.internal.pageSize.getHeight() - 20;

  doc.setFontSize(8);
  doc.setTextColor(...PDF_COLORS.muted);
  doc.text("Generated with GetPaid — getpaid.dev", pageWidth / 2, footerY, { align: "center" });
}

export function generateInvoicePdf(invoice: InvoicePdfData): void {
  const doc = new jsPDF();

  renderHeader(doc, invoice);
  renderSenderInfo(doc, invoice);
  renderClientInfo(doc, invoice);
  renderDates(doc, invoice);
  const tableEndY = renderItemsTable(doc, invoice);
  const totalsEndY = renderTotals(doc, invoice, tableEndY);

  renderNotes(doc, invoice, totalsEndY);
  renderFooter(doc);

  doc.save(`invoice-${invoice.publicId}.pdf`);
}
