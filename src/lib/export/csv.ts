export function escapeCSVValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return "";
  }
  const str = String(value);
  const escaped = str.replace(/"/g, '""');
  if (escaped.includes(",") || escaped.includes("\n") || escaped.includes('"')) {
    return `"${escaped}"`;
  }
  return escaped;
}

export function arrayToCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: { key: keyof T; header: string }[]
): string {
  const headers = columns.map((col) => escapeCSVValue(col.header)).join(",");
  const rows = data.map((row) =>
    columns.map((col) => escapeCSVValue(row[col.key] as string | number | null)).join(",")
  );
  return [headers, ...rows].join("\n");
}

export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

interface InvoiceExportData {
  id: string;
  publicId: string;
  status: string;
  currency: string;
  total: number;
  dueDate: string;
  createdAt: string;
  client: {
    name: string;
    email: string;
  };
}

export function exportInvoicesToCSV(invoices: InvoiceExportData[]): void {
  const formattedData = invoices.map((invoice) => ({
    invoiceNumber: invoice.publicId,
    clientName: invoice.client.name,
    clientEmail: invoice.client.email,
    status: invoice.status,
    amount: (invoice.total / 100).toFixed(2),
    currency: invoice.currency,
    dueDate: new Date(invoice.dueDate).toLocaleDateString(),
    createdAt: new Date(invoice.createdAt).toLocaleDateString(),
  }));

  const columns = [
    { key: "invoiceNumber" as const, header: "Invoice #" },
    { key: "clientName" as const, header: "Client Name" },
    { key: "clientEmail" as const, header: "Client Email" },
    { key: "status" as const, header: "Status" },
    { key: "amount" as const, header: "Amount" },
    { key: "currency" as const, header: "Currency" },
    { key: "dueDate" as const, header: "Due Date" },
    { key: "createdAt" as const, header: "Created At" },
  ];

  const csv = arrayToCSV(formattedData, columns);
  const date = new Date().toISOString().split("T")[0];
  downloadCSV(csv, `invoices-${date}.csv`);
}

interface ClientExportData {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export function exportClientsToCSV(clients: ClientExportData[]): void {
  const formattedData = clients.map((client) => ({
    name: client.name,
    email: client.email,
    createdAt: new Date(client.createdAt).toLocaleDateString(),
  }));

  const columns = [
    { key: "name" as const, header: "Name" },
    { key: "email" as const, header: "Email" },
    { key: "createdAt" as const, header: "Created At" },
  ];

  const csv = arrayToCSV(formattedData, columns);
  const date = new Date().toISOString().split("T")[0];
  downloadCSV(csv, `clients-${date}.csv`);
}
