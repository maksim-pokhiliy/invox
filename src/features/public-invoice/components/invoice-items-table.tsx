"use client";

import type { InvoiceItemGroupResponse, InvoiceItemResponse } from "@app/shared/schemas/api";
import { InvoiceItemsTable as SharedInvoiceItemsTable } from "@app/shared/ui/invoice-items-table";

interface InvoiceItemsTableProps {
  items: InvoiceItemResponse[];
  itemGroups?: InvoiceItemGroupResponse[];
  currency: string;
}

export function InvoiceItemsTable({ items, itemGroups, currency }: InvoiceItemsTableProps) {
  return <SharedInvoiceItemsTable items={items} itemGroups={itemGroups} currency={currency} />;
}
