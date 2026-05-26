import { INVOICE_STATUS } from "@app/shared/config/invoice-status";

export interface OverdueInvoice {
  status: string;
  dueDate: Date | string;
  paidAt: Date | string | null;
}

export function isOverdue(invoice: OverdueInvoice, now: Date): boolean {
  if (invoice.status === INVOICE_STATUS.DRAFT) {
    return false;
  }

  if (invoice.paidAt) {
    return false;
  }

  const due = invoice.dueDate instanceof Date ? invoice.dueDate : new Date(invoice.dueDate);

  return due < now;
}
