import type { RecurringFrequency } from "@prisma/client";
import { nanoid } from "nanoid";

import { NANOID } from "@app/shared/config/config";
import {
  type DiscountTypeValue,
  INVOICE_EVENT,
  INVOICE_STATUS,
} from "@app/shared/config/invoice-status";
import { buildDiscountInput, calculateTotals } from "@app/shared/lib/calculations";

import { prisma } from "@app/server/db";
import { createItemGroups } from "@app/server/invoices/item-groups";

interface RecurringItem {
  title: string;
  description: string | null;
  quantity: number;
  unitPrice: number;
  sortOrder: number;
}

interface RecurringItemGroup {
  title: string;
  sortOrder: number;
  items: RecurringItem[];
}

export function calculateNextRunDate(currentDate: Date, frequency: RecurringFrequency): Date {
  const next = new Date(currentDate);

  switch (frequency) {
    case "WEEKLY":
      next.setDate(next.getDate() + 7);
      break;
    case "BIWEEKLY":
      next.setDate(next.getDate() + 14);
      break;
    case "MONTHLY":
      next.setMonth(next.getMonth() + 1);
      break;
    case "QUARTERLY":
      next.setMonth(next.getMonth() + 3);
      break;
    case "YEARLY":
      next.setFullYear(next.getFullYear() + 1);
      break;
  }

  return next;
}

export async function generateInvoiceFromRecurring(recurringInvoice: {
  id: string;
  userId: string;
  clientId: string;
  currency: string;
  discountType: DiscountTypeValue | null;
  discountValue: number;
  taxRate: number;
  notes: string | null;
  dueDays: number;
  autoSend: boolean;
  frequency: RecurringFrequency;
  items: RecurringItem[];
  itemGroups: RecurringItemGroup[];
}) {
  const allItems = [
    ...recurringInvoice.items,
    ...recurringInvoice.itemGroups.flatMap((g) => g.items),
  ];

  const discount = buildDiscountInput(
    recurringInvoice.discountType,
    recurringInvoice.discountValue
  );

  const { subtotal, discountAmount, taxAmount, total } = calculateTotals(
    allItems,
    discount,
    recurringInvoice.taxRate
  );

  const dueDate = new Date();

  dueDate.setDate(dueDate.getDate() + recurringInvoice.dueDays);

  const invoice = await prisma.invoice.create({
    data: {
      userId: recurringInvoice.userId,
      clientId: recurringInvoice.clientId,
      publicId: nanoid(NANOID.PUBLIC_ID_LENGTH),
      currency: recurringInvoice.currency,
      status: recurringInvoice.autoSend ? INVOICE_STATUS.SENT : INVOICE_STATUS.DRAFT,
      subtotal,
      discountType: recurringInvoice.discountType,
      discountValue: recurringInvoice.discountValue,
      discountAmount,
      taxRate: recurringInvoice.taxRate,
      taxAmount,
      total,
      dueDate,
      notes: recurringInvoice.notes,
      sentAt: recurringInvoice.autoSend ? new Date() : null,
      items: {
        create: recurringInvoice.items.map((item, i) => ({
          title: item.title,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: Math.round(item.quantity * item.unitPrice),
          sortOrder: item.sortOrder ?? i,
        })),
      },
      events: {
        create: {
          type: INVOICE_EVENT.CREATED,
          payload: { source: "recurring", recurringInvoiceId: recurringInvoice.id },
        },
      },
    },
  });

  if (recurringInvoice.itemGroups.length > 0) {
    await createItemGroups(
      invoice.id,
      recurringInvoice.itemGroups.map((g) => ({
        title: g.title,
        sortOrder: g.sortOrder,
        items: g.items.map((item) => ({
          title: item.title,
          description: item.description ?? undefined,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          sortOrder: item.sortOrder,
        })),
      }))
    );
  }

  const nextRunAt = calculateNextRunDate(new Date(), recurringInvoice.frequency);

  await prisma.recurringInvoice.update({
    where: { id: recurringInvoice.id },
    data: {
      lastRunAt: new Date(),
      nextRunAt,
    },
  });

  return invoice;
}

export async function processDueRecurringInvoices() {
  const now = new Date();

  const dueRecurring = await prisma.recurringInvoice.findMany({
    where: {
      status: "ACTIVE",
      nextRunAt: { lte: now },
      OR: [{ endDate: null }, { endDate: { gt: now } }],
    },
    include: {
      items: true,
      itemGroups: {
        include: { items: true },
      },
    },
  });

  const results = [];

  for (const recurring of dueRecurring) {
    try {
      const invoice = await generateInvoiceFromRecurring(recurring);

      results.push({ success: true, recurringId: recurring.id, invoiceId: invoice.id });
    } catch (error) {
      results.push({
        success: false,
        recurringId: recurring.id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return results;
}
