import { prisma } from "@app/server/db";
import { DiscountType } from "@prisma/client";

export interface TemplateItemInput {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateTemplateInput {
  name: string;
  description?: string;
  currency?: string;
  discount?: {
    type: "PERCENTAGE" | "FIXED";
    value: number;
  };
  taxRate?: number;
  notes?: string;
  dueDays?: number;
  items: TemplateItemInput[];
}

export interface UpdateTemplateInput {
  name?: string;
  description?: string;
  currency?: string;
  discount?: {
    type: "PERCENTAGE" | "FIXED";
    value: number;
  } | null;
  taxRate?: number;
  notes?: string;
  dueDays?: number;
  items?: TemplateItemInput[];
}

export async function getTemplates(userId: string) {
  return prisma.invoiceTemplate.findMany({
    where: { userId },
    include: {
      items: true,
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getTemplate(id: string, userId: string) {
  return prisma.invoiceTemplate.findFirst({
    where: { id, userId },
    include: {
      items: true,
    },
  });
}

export async function createTemplate(userId: string, data: CreateTemplateInput) {
  return prisma.invoiceTemplate.create({
    data: {
      userId,
      name: data.name,
      description: data.description,
      currency: data.currency || "USD",
      discountType: data.discount?.type as DiscountType | undefined,
      discountValue: data.discount?.value || 0,
      taxRate: data.taxRate || 0,
      notes: data.notes,
      dueDays: data.dueDays || 30,
      items: {
        create: data.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      },
    },
    include: {
      items: true,
    },
  });
}

export async function updateTemplate(id: string, userId: string, data: UpdateTemplateInput) {
  const template = await prisma.invoiceTemplate.findFirst({
    where: { id, userId },
  });

  if (!template) {
    return null;
  }

  const updateData: Record<string, unknown> = {};

  if (data.name !== undefined) {
    updateData.name = data.name;
  }
  if (data.description !== undefined) {
    updateData.description = data.description;
  }
  if (data.currency !== undefined) {
    updateData.currency = data.currency;
  }
  if (data.taxRate !== undefined) {
    updateData.taxRate = data.taxRate;
  }
  if (data.notes !== undefined) {
    updateData.notes = data.notes;
  }
  if (data.dueDays !== undefined) {
    updateData.dueDays = data.dueDays;
  }

  if (data.discount !== undefined) {
    if (data.discount) {
      updateData.discountType = data.discount.type;
      updateData.discountValue = data.discount.value;
    } else {
      updateData.discountType = null;
      updateData.discountValue = 0;
    }
  }

  if (data.items !== undefined) {
    await prisma.invoiceTemplateItem.deleteMany({
      where: { templateId: id },
    });

    await prisma.invoiceTemplateItem.createMany({
      data: data.items.map((item) => ({
        templateId: id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    });
  }

  return prisma.invoiceTemplate.update({
    where: { id },
    data: updateData,
    include: {
      items: true,
    },
  });
}

export async function deleteTemplate(id: string, userId: string) {
  const template = await prisma.invoiceTemplate.findFirst({
    where: { id, userId },
  });

  if (!template) {
    return null;
  }

  await prisma.invoiceTemplateItem.deleteMany({
    where: { templateId: id },
  });

  await prisma.invoiceTemplate.delete({
    where: { id },
  });

  return { success: true };
}
