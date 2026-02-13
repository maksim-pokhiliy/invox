import { SenderProfileInput } from "@app/shared/schemas";

import { prisma } from "@app/server/db";

function buildCreateData(data: SenderProfileInput) {
  return {
    companyName: data.companyName ?? null,
    displayName: data.displayName ?? null,
    emailFrom: data.emailFrom ?? null,
    address: data.address ?? null,
    taxId: data.taxId ?? null,
    defaultCurrency: data.defaultCurrency ?? "USD",
    logoUrl: data.logoUrl ?? null,
    primaryColor: data.primaryColor ?? null,
    accentColor: data.accentColor ?? null,
    footerText: data.footerText ?? null,
    fontFamily: data.fontFamily ?? null,
    invoicePrefix: data.invoicePrefix ?? null,
    defaultRate: data.defaultRate ?? null,
  };
}

function buildUpdateData(data: SenderProfileInput) {
  return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
}

export async function getSenderProfile(userId: string) {
  return prisma.senderProfile.findUnique({
    where: { userId },
  });
}

export async function createSenderProfile(userId: string, data: SenderProfileInput) {
  return prisma.senderProfile.create({
    data: {
      userId,
      ...buildCreateData(data),
    },
  });
}

export async function updateSenderProfile(userId: string, data: SenderProfileInput) {
  return prisma.senderProfile.update({
    where: { userId },
    data: buildUpdateData(data),
  });
}

export async function upsertSenderProfile(userId: string, data: SenderProfileInput) {
  return prisma.senderProfile.upsert({
    where: { userId },
    create: { userId, ...buildCreateData(data) },
    update: buildUpdateData(data),
  });
}
