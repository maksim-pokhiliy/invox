import { prisma } from "@app/server/db";
import type { RecurringFrequency, RecurringStatus } from "@prisma/client";
import type { DiscountTypeValue } from "@app/shared/config/invoice-status";

export class ClientNotFoundError extends Error {
  constructor() {
    super("Client not found");
    this.name = "ClientNotFoundError";
  }
}

export class RecurringInvoiceNotFoundError extends Error {
  constructor() {
    super("Recurring invoice not found");
    this.name = "RecurringInvoiceNotFoundError";
  }
}

export interface CreateRecurringInvoiceInput {
  clientId: string;
  name: string;
  frequency: RecurringFrequency;
  currency?: string;
  discount?: {
    type: DiscountTypeValue;
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
    type: DiscountTypeValue;
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

const RECURRING_CLIENT_SELECT = { id: true, name: true, email: true } as const;

export async function createRecurringInvoice(userId: string, data: CreateRecurringInvoiceInput) {
  const client = await prisma.client.findFirst({
    where: { id: data.clientId, userId },
  });

  if (!client) {
    throw new ClientNotFoundError();
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
      client: { select: RECURRING_CLIENT_SELECT },
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
    throw new RecurringInvoiceNotFoundError();
  }

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
      client: { select: RECURRING_CLIENT_SELECT },
      items: true,
    },
  });
}

export async function deleteRecurringInvoice(userId: string, id: string) {
  const existing = await prisma.recurringInvoice.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new RecurringInvoiceNotFoundError();
  }

  await prisma.recurringInvoice.delete({
    where: { id },
  });

  return { success: true };
}
