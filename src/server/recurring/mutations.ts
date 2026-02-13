import type { RecurringFrequency, RecurringStatus } from "@prisma/client";

import { BRANDING, INVOICE } from "@app/shared/config/config";
import type { DiscountInput } from "@app/shared/lib/calculations";
import type { LineItemGroupInput, LineItemInput } from "@app/shared/schemas";

import { prisma } from "@app/server/db";

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
  discount?: DiscountInput;
  taxRate?: number;
  notes?: string;
  dueDays?: number;
  autoSend?: boolean;
  startDate: Date;
  endDate?: Date;
  items: LineItemInput[];
  itemGroups?: LineItemGroupInput[];
}

export interface UpdateRecurringInvoiceInput {
  name?: string;
  frequency?: RecurringFrequency;
  status?: RecurringStatus;
  currency?: string;
  discount?: DiscountInput | null;
  taxRate?: number;
  notes?: string;
  dueDays?: number;
  autoSend?: boolean;
  nextRunAt?: Date;
  endDate?: Date | null;
  items?: LineItemInput[];
  itemGroups?: LineItemGroupInput[];
}

const RECURRING_INCLUDE = {
  client: { select: { id: true, name: true, email: true } },
  items: { orderBy: { sortOrder: "asc" as const } },
  itemGroups: {
    include: { items: { orderBy: { sortOrder: "asc" as const } } },
    orderBy: { sortOrder: "asc" as const },
  },
};

async function createRecurringItemGroups(recurringInvoiceId: string, groups: LineItemGroupInput[]) {
  for (let gi = 0; gi < groups.length; gi++) {
    const group = groups[gi];
    const created = await prisma.recurringInvoiceItemGroup.create({
      data: {
        recurringInvoiceId,
        title: group.title,
        sortOrder: gi,
      },
    });

    if (group.items.length > 0) {
      await prisma.recurringInvoiceItem.createMany({
        data: group.items.map((item, ii) => ({
          recurringInvoiceId,
          groupId: created.id,
          title: item.title,
          description: item.description ?? null,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          sortOrder: ii,
        })),
      });
    }
  }
}

async function deleteRecurringItems(recurringInvoiceId: string) {
  await prisma.recurringInvoiceItem.deleteMany({ where: { recurringInvoiceId } });
  await prisma.recurringInvoiceItemGroup.deleteMany({ where: { recurringInvoiceId } });
}

export async function createRecurringInvoice(userId: string, data: CreateRecurringInvoiceInput) {
  const client = await prisma.client.findFirst({
    where: { id: data.clientId, userId },
  });

  if (!client) {
    throw new ClientNotFoundError();
  }

  const recurring = await prisma.recurringInvoice.create({
    data: {
      userId,
      clientId: data.clientId,
      name: data.name,
      frequency: data.frequency,
      currency: data.currency || BRANDING.DEFAULT_CURRENCY,
      discountType: data.discount?.type || null,
      discountValue: data.discount?.value || 0,
      taxRate: data.taxRate || 0,
      notes: data.notes || null,
      dueDays: data.dueDays || INVOICE.DEFAULT_DUE_DAYS,
      autoSend: data.autoSend || false,
      nextRunAt: data.startDate,
      endDate: data.endDate || null,
      items: {
        create: data.items.map((item, i) => ({
          title: item.title,
          description: item.description ?? null,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          sortOrder: item.sortOrder ?? i,
        })),
      },
    },
    include: RECURRING_INCLUDE,
  });

  if (data.itemGroups?.length) {
    await createRecurringItemGroups(recurring.id, data.itemGroups);

    return prisma.recurringInvoice.findUniqueOrThrow({
      where: { id: recurring.id },
      include: RECURRING_INCLUDE,
    });
  }

  return recurring;
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

  const hasItemChanges = data.items !== undefined || data.itemGroups !== undefined;

  if (hasItemChanges) {
    await deleteRecurringItems(id);
  }

  const updated = await prisma.recurringInvoice.update({
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
      ...(hasItemChanges &&
        data.items && {
          items: {
            create: data.items.map((item, i) => ({
              title: item.title,
              description: item.description ?? null,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              sortOrder: item.sortOrder ?? i,
            })),
          },
        }),
    },
    include: RECURRING_INCLUDE,
  });

  if (hasItemChanges && data.itemGroups?.length) {
    await createRecurringItemGroups(id, data.itemGroups);

    return prisma.recurringInvoice.findUniqueOrThrow({
      where: { id },
      include: RECURRING_INCLUDE,
    });
  }

  return updated;
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
