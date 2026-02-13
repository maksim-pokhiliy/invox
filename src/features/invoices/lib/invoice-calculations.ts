import { BRANDING, INVOICE, TIME } from "@app/shared/config/config";
import type { InvoiceFormInput, InvoiceItemGroupInput } from "@app/shared/schemas";

export function getDefaultDueDate(): string {
  return new Date(Date.now() + INVOICE.DEFAULT_DUE_DAYS * TIME.DAY).toISOString().split("T")[0];
}

export function getTemplateDueDate(dueDays: number): string {
  return new Date(Date.now() + dueDays * TIME.DAY).toISOString().split("T")[0];
}

export function getFormDefaults(
  dueDate: string,
  currency = BRANDING.DEFAULT_CURRENCY
): InvoiceFormInput {
  return {
    clientId: "",
    currency,
    dueDate,
    items: [{ title: "", description: "", quantity: 1, unitPrice: 0 }],
    itemGroups: [],
    notes: "",
  };
}

export function computeSubtotal(items: InvoiceFormInput["items"], groups: InvoiceItemGroupInput[]) {
  const itemsTotal = items.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
    0
  );
  const groupsTotal = groups.reduce(
    (sum, group) =>
      sum + group.items.reduce((gs, item) => gs + (item.quantity || 0) * (item.unitPrice || 0), 0),
    0
  );

  return itemsTotal + groupsTotal;
}
