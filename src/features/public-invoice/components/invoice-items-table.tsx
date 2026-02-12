"use client";

import { InvoiceItemsTable as SharedInvoiceItemsTable } from "@app/shared/ui/invoice-items-table";

interface InvoiceItem {
  id: string;
  title: string;
  description?: string | null;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface InvoiceItemGroup {
  id: string;
  title: string;
  items: InvoiceItem[];
}

interface InvoiceItemsTableProps {
  items: InvoiceItem[];
  itemGroups?: InvoiceItemGroup[];
  currency: string;
}

export function InvoiceItemsTable({ items, itemGroups, currency }: InvoiceItemsTableProps) {
  return <SharedInvoiceItemsTable items={items} itemGroups={itemGroups} currency={currency} />;
}
