import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

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
  client: {
    name: string;
    email: string;
  };
  sender?: {
    companyName?: string | null;
    displayName?: string | null;
    email?: string | null;
    address?: string | null;
  } | null;
  items: InvoiceItem[];
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount / 100);
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateString));
}

export function generateInvoicePdf(invoice: InvoicePdfData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Colors
  const primaryColor: [number, number, number] = [79, 70, 229]; // #4f46e5
  const textColor: [number, number, number] = [31, 41, 55]; // gray-800
  const mutedColor: [number, number, number] = [107, 114, 128]; // gray-500

  // Header
  doc.setFontSize(28);
  doc.setTextColor(...primaryColor);
  doc.text("INVOICE", 20, 30);

  doc.setFontSize(12);
  doc.setTextColor(...mutedColor);
  doc.text(`#${invoice.publicId}`, 20, 38);

  // Status badge
  const statusColors: Record<string, [number, number, number]> = {
    PAID: [34, 197, 94],
    OVERDUE: [239, 68, 68],
    SENT: [59, 130, 246],
    VIEWED: [59, 130, 246],
    DRAFT: [156, 163, 175],
  };
  const statusColor = statusColors[invoice.status] || statusColors.DRAFT;
  doc.setFillColor(...statusColor);
  doc.roundedRect(pageWidth - 50, 22, 30, 10, 2, 2, "F");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(invoice.status, pageWidth - 35, 29, { align: "center" });

  // From/To section
  let yPos = 55;

  // From (Sender)
  doc.setFontSize(10);
  doc.setTextColor(...mutedColor);
  doc.text("FROM", 20, yPos);

  doc.setFontSize(11);
  doc.setTextColor(...textColor);
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
    const addressLines = invoice.sender.address.split("\n");
    addressLines.forEach((line) => {
      doc.text(line, 20, yPos);
      yPos += 5;
    });
  }

  // To (Client)
  yPos = 55;
  doc.setFontSize(10);
  doc.setTextColor(...mutedColor);
  doc.text("BILL TO", pageWidth / 2 + 10, yPos);

  doc.setFontSize(11);
  doc.setTextColor(...textColor);
  yPos += 7;
  doc.setFont("helvetica", "bold");
  doc.text(invoice.client.name, pageWidth / 2 + 10, yPos);
  yPos += 5;
  doc.setFont("helvetica", "normal");
  doc.text(invoice.client.email, pageWidth / 2 + 10, yPos);

  // Dates section
  yPos = 100;
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(20, yPos - 5, pageWidth - 40, 25, 3, 3, "F");

  doc.setFontSize(9);
  doc.setTextColor(...mutedColor);
  doc.text("INVOICE DATE", 30, yPos + 3);
  doc.text("DUE DATE", 90, yPos + 3);
  if (invoice.paidAt) {
    doc.text("PAID DATE", 150, yPos + 3);
  }

  doc.setFontSize(10);
  doc.setTextColor(...textColor);
  doc.text(formatDate(invoice.createdAt), 30, yPos + 12);
  doc.text(formatDate(invoice.dueDate), 90, yPos + 12);
  if (invoice.paidAt) {
    doc.text(formatDate(invoice.paidAt), 150, yPos + 12);
  }

  // Items table
  yPos = 135;
  const tableData = invoice.items.map((item) => [
    item.description,
    item.quantity.toString(),
    formatCurrency(item.unitPrice, invoice.currency),
    formatCurrency(item.amount, invoice.currency),
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [["Description", "Qty", "Unit Price", "Amount"]],
    body: tableData,
    theme: "plain",
    headStyles: {
      fillColor: [249, 250, 251],
      textColor: textColor,
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      textColor: textColor,
      fontSize: 10,
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 25, halign: "right" },
      2: { cellWidth: 40, halign: "right" },
      3: { cellWidth: 40, halign: "right" },
    },
    margin: { left: 20, right: 20 },
  });

  // Totals section
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  yPos = (doc as any).lastAutoTable.finalY + 15;

  const totalsX = pageWidth - 90;
  const totalsWidth = 70;

  // Subtotal
  doc.setFontSize(10);
  doc.setTextColor(...mutedColor);
  doc.text("Subtotal", totalsX, yPos);
  doc.setTextColor(...textColor);
  doc.text(formatCurrency(invoice.subtotal, invoice.currency), totalsX + totalsWidth, yPos, {
    align: "right",
  });
  yPos += 8;

  // Discount (if any)
  if (invoice.discountAmount && invoice.discountAmount > 0) {
    doc.setTextColor(...mutedColor);
    const discountLabel =
      invoice.discountType === "PERCENTAGE" ? `Discount (${invoice.discountValue}%)` : "Discount";
    doc.text(discountLabel, totalsX, yPos);
    doc.setTextColor(239, 68, 68); // Red for discount
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

  // Tax (if any)
  if (invoice.taxAmount && invoice.taxAmount > 0) {
    doc.setTextColor(...mutedColor);
    doc.text(`Tax (${invoice.taxRate}%)`, totalsX, yPos);
    doc.setTextColor(...textColor);
    doc.text(formatCurrency(invoice.taxAmount, invoice.currency), totalsX + totalsWidth, yPos, {
      align: "right",
    });
    yPos += 8;
  }

  // Divider
  doc.setDrawColor(229, 231, 235);
  doc.line(totalsX, yPos, totalsX + totalsWidth, yPos);
  yPos += 10;

  // Total
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...textColor);
  doc.text("Total", totalsX, yPos);
  doc.setTextColor(...primaryColor);
  doc.text(formatCurrency(invoice.total, invoice.currency), totalsX + totalsWidth, yPos, {
    align: "right",
  });

  // Notes (if any)
  if (invoice.notes) {
    yPos += 25;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...mutedColor);
    doc.text("Notes", 20, yPos);
    yPos += 6;
    doc.setFontSize(10);
    doc.setTextColor(...textColor);
    const noteLines = doc.splitTextToSize(invoice.notes, pageWidth - 40);
    doc.text(noteLines, 20, yPos);
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setFontSize(8);
  doc.setTextColor(...mutedColor);
  doc.text("Generated with Invox", pageWidth / 2, footerY, { align: "center" });

  // Save the PDF
  doc.save(`invoice-${invoice.publicId}.pdf`);
}
