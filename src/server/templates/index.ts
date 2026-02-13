import { BRANDING, INVOICE } from "@app/shared/config/config";
import type { DiscountInput } from "@app/shared/lib/calculations";
import type { LineItemGroupInput, LineItemInput } from "@app/shared/schemas";

import { prisma } from "@app/server/db";

export interface CreateTemplateInput {
  name: string;
  description?: string;
  currency?: string;
  discount?: DiscountInput;
  taxRate?: number;
  notes?: string;
  dueDays?: number;
  items: LineItemInput[];
  itemGroups?: LineItemGroupInput[];
}

export interface UpdateTemplateInput {
  name?: string;
  description?: string;
  currency?: string;
  discount?: DiscountInput | null;
  taxRate?: number;
  notes?: string;
  dueDays?: number;
  items?: LineItemInput[];
  itemGroups?: LineItemGroupInput[];
}

const ITEMS_INCLUDE = {
  items: { orderBy: { sortOrder: "asc" as const } },
  itemGroups: {
    include: { items: { orderBy: { sortOrder: "asc" as const } } },
    orderBy: { sortOrder: "asc" as const },
  },
};

export async function getTemplates(userId: string) {
  return prisma.invoiceTemplate.findMany({
    where: { userId },
    include: ITEMS_INCLUDE,
    orderBy: { updatedAt: "desc" },
  });
}

export async function getTemplate(id: string, userId: string) {
  return prisma.invoiceTemplate.findFirst({
    where: { id, userId },
    include: ITEMS_INCLUDE,
  });
}

async function createTemplateItemGroups(templateId: string, groups: LineItemGroupInput[]) {
  for (let gi = 0; gi < groups.length; gi++) {
    const group = groups[gi];
    const created = await prisma.invoiceTemplateItemGroup.create({
      data: {
        templateId,
        title: group.title,
        sortOrder: gi,
      },
    });

    if (group.items.length > 0) {
      await prisma.invoiceTemplateItem.createMany({
        data: group.items.map((item, ii) => ({
          templateId,
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

async function deleteTemplateItems(templateId: string) {
  await prisma.invoiceTemplateItem.deleteMany({ where: { templateId } });
  await prisma.invoiceTemplateItemGroup.deleteMany({ where: { templateId } });
}

export async function createTemplate(userId: string, data: CreateTemplateInput) {
  const template = await prisma.invoiceTemplate.create({
    data: {
      userId,
      name: data.name,
      description: data.description,
      currency: data.currency || BRANDING.DEFAULT_CURRENCY,
      discountType: data.discount?.type,
      discountValue: data.discount?.value || 0,
      taxRate: data.taxRate || 0,
      notes: data.notes,
      dueDays: data.dueDays || INVOICE.DEFAULT_DUE_DAYS,
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
    include: ITEMS_INCLUDE,
  });

  if (data.itemGroups?.length) {
    await createTemplateItemGroups(template.id, data.itemGroups);

    return prisma.invoiceTemplate.findUniqueOrThrow({
      where: { id: template.id },
      include: ITEMS_INCLUDE,
    });
  }

  return template;
}

function buildTemplateUpdateData(data: UpdateTemplateInput) {
  return {
    ...(data.name !== undefined && { name: data.name }),
    ...(data.description !== undefined && { description: data.description }),
    ...(data.currency !== undefined && { currency: data.currency }),
    ...(data.taxRate !== undefined && { taxRate: data.taxRate }),
    ...(data.notes !== undefined && { notes: data.notes }),
    ...(data.dueDays !== undefined && { dueDays: data.dueDays }),
    ...(data.discount !== undefined &&
      (data.discount
        ? { discountType: data.discount.type, discountValue: data.discount.value }
        : { discountType: null, discountValue: 0 })),
  };
}

function buildItemsCreate(items: NonNullable<UpdateTemplateInput["items"]>) {
  return {
    items: {
      create: items.map((item, i) => ({
        title: item.title,
        description: item.description ?? null,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        sortOrder: item.sortOrder ?? i,
      })),
    },
  };
}

export async function updateTemplate(id: string, userId: string, data: UpdateTemplateInput) {
  const template = await prisma.invoiceTemplate.findFirst({
    where: { id, userId },
  });

  if (!template) {
    return null;
  }

  const hasItemChanges = data.items !== undefined || data.itemGroups !== undefined;

  if (hasItemChanges) {
    await deleteTemplateItems(id);
  }

  const updated = await prisma.invoiceTemplate.update({
    where: { id },
    data: {
      ...buildTemplateUpdateData(data),
      ...(hasItemChanges && data.items && buildItemsCreate(data.items)),
    },
    include: ITEMS_INCLUDE,
  });

  if (hasItemChanges && data.itemGroups?.length) {
    await createTemplateItemGroups(id, data.itemGroups);

    return prisma.invoiceTemplate.findUniqueOrThrow({
      where: { id },
      include: ITEMS_INCLUDE,
    });
  }

  return updated;
}

export async function deleteTemplate(id: string, userId: string) {
  const template = await prisma.invoiceTemplate.findFirst({
    where: { id, userId },
  });

  if (!template) {
    return null;
  }

  await prisma.invoiceTemplate.delete({
    where: { id },
  });

  return { success: true };
}
