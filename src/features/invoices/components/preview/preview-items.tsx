"use client";

import { InvoiceItemsTable } from "@app/shared/ui/invoice-items-table";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface InvoiceItemGroup {
  id: string;
  title: string;
  items: InvoiceItem[];
}

interface PreviewItemsProps {
  items: InvoiceItem[];
  itemGroups?: InvoiceItemGroup[];
  currency: string;
}

export function PreviewItems({ items, itemGroups, currency }: PreviewItemsProps) {
  return (
    <InvoiceItemsTable items={items} itemGroups={itemGroups} currency={currency} size="small" />
  );
}
