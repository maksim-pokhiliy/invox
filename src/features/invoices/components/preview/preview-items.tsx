"use client";

import type { InvoiceItemGroupResponse, InvoiceItemResponse } from "@app/shared/schemas/api";
import { InvoiceItemsTable } from "@app/shared/ui/invoice-items-table";

interface PreviewItemsProps {
  items: InvoiceItemResponse[];
  itemGroups?: InvoiceItemGroupResponse[];
  currency: string;
}

export function PreviewItems({ items, itemGroups, currency }: PreviewItemsProps) {
  return (
    <InvoiceItemsTable items={items} itemGroups={itemGroups} currency={currency} size="small" />
  );
}
