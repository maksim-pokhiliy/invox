import { prisma } from "@app/server/db";
import { nanoid } from "nanoid";
import type { RecurringFrequency, RecurringStatus } from "@prisma/client";

export interface CreateRecurringInvoiceInput {
  clientId: string;
  name: string;
  frequency: RecurringFrequency;
  currency?: string;
  discount?: {
    type: "PERCENTAGE" | "FIXED";
    value: number;
  };
  taxRate?: number;
  notes?: string;
  dueDays?: number;
  autoSend?: boolean;
  startDate: Date;
  endDate?: Date;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
  }[];
}

export interface UpdateRecurringInvoiceInput {
  name?: string;
  frequency?: RecurringFrequency;
  status?: RecurringStatus;
  currency?: string;
  discount?: {
    type: "PERCENTAGE" | "FIXED";
    value: number;
  } | null;
  taxRate?: number;
  notes?: string;
  dueDays?: number;
  autoSend?: boolean;
  nextRunAt?: Date;
  endDate?: Date | null;
  items?: {
    description: string;
    quantity: number;
    unitPrice: number;
  }[];
}

export async function getRecurringInvoices(userId: string) {
  return prisma.recurringInvoice.findMany({
    where: { userId },
    include: {
      client: {
        select: { id: true, name: true, email: true },
      },
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getRecurringInvoice(userId: string, id: string) {
  return prisma.recurringInvoice.findFirst({
    where: { id, userId },
    include: {
      client: {
        select: { id: true, name: true, email: true },
      },
      items: true,
    },
  });
}

export async function createRecurringInvoice(userId: string, data: CreateRecurringInvoiceInput) {
  // Verify client belongs to user
  const client = await prisma.client.findFirst({
    where: { id: data.clientId, userId },
  });

  if (!client) {
    throw new Error("Client not found");
  }

  return prisma.recurringInvoice.create({
    data: {
      userId,
      clientId: data.clientId,
      name: data.name,
      frequency: data.frequency,
      currency: data.currency || "USD",
      discountType: data.discount?.type || null,
      discountValue: data.discount?.value || 0,
      taxRate: data.taxRate || 0,
      notes: data.notes || null,
      dueDays: data.dueDays || 30,
      autoSend: data.autoSend || false,
      nextRunAt: data.startDate,
      endDate: data.endDate || null,
      items: {
        create: data.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      },
    },
    include: {
      client: {
        select: { id: true, name: true, email: true },
      },
      items: true,
    },
  });
}

export async function updateRecurringInvoice(
  userId: string,
  id: string,
  data: UpdateRecurringInvoiceInput
) {
  const existing = await prisma.recurringInvoice.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new Error("Recurring invoice not found");
  }

  // If items are provided, delete existing and create new
  if (data.items) {
    await prisma.recurringInvoiceItem.deleteMany({
      where: { recurringInvoiceId: id },
    });
  }

  return prisma.recurringInvoice.update({
    where: { id },
    data: {
      name: data.name,
      frequency: data.frequency,
      status: data.status,
      currency: data.currency,
      discountType: data.discount === null ? null : data.discount?.type,
      discountValue: data.discount === null ? 0 : data.discount?.value,
      taxRate: data.taxRate,
      notes: data.notes,
      dueDays: data.dueDays,
      autoSend: data.autoSend,
      nextRunAt: data.nextRunAt,
      endDate: data.endDate,
      ...(data.items && {
        items: {
          create: data.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      }),
    },
    include: {
      client: {
        select: { id: true, name: true, email: true },
      },
      items: true,
    },
  });
}

export async function deleteRecurringInvoice(userId: string, id: string) {
  const existing = await prisma.recurringInvoice.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new Error("Recurring invoice not found");
  }

  await prisma.recurringInvoice.delete({
    where: { id },
  });

  return { success: true };
}

// Calculate next run date based on frequency
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

// Generate invoice from recurring invoice
export async function generateInvoiceFromRecurring(recurringInvoice: {
  id: string;
  userId: string;
  clientId: string;
  currency: string;
  discountType: "PERCENTAGE" | "FIXED" | null;
  discountValue: number;
  taxRate: number;
  notes: string | null;
  dueDays: number;
  autoSend: boolean;
  frequency: RecurringFrequency;
  items: { description: string; quantity: number; unitPrice: number }[];
}) {
  // Calculate totals
  const subtotal = recurringInvoice.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  let discountAmount = 0;
  if (recurringInvoice.discountType === "PERCENTAGE") {
    discountAmount = Math.round((subtotal * recurringInvoice.discountValue) / 100);
  } else if (recurringInvoice.discountType === "FIXED") {
    discountAmount = recurringInvoice.discountValue;
  }

  const afterDiscount = subtotal - discountAmount;
  const taxAmount = Math.round((afterDiscount * recurringInvoice.taxRate) / 100);
  const total = afterDiscount + taxAmount;

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + recurringInvoice.dueDays);

  // Create the invoice
  const invoice = await prisma.invoice.create({
    data: {
      userId: recurringInvoice.userId,
      clientId: recurringInvoice.clientId,
      publicId: nanoid(10),
      currency: recurringInvoice.currency,
      status: recurringInvoice.autoSend ? "SENT" : "DRAFT",
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
        create: recurringInvoice.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.quantity * item.unitPrice,
        })),
      },
      events: {
        create: {
          type: "CREATED",
          payload: { source: "recurring", recurringInvoiceId: recurringInvoice.id },
        },
      },
    },
  });

  // Update recurring invoice with next run date
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

// Process all due recurring invoices (called by cron job or manual trigger)
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
