import { prisma } from "@app/server/db";
import { SenderProfileInput } from "@app/shared/schemas";

export async function getSenderProfile(userId: string) {
  return prisma.senderProfile.findUnique({
    where: { userId },
  });
}

export async function createSenderProfile(userId: string, data: SenderProfileInput) {
  return prisma.senderProfile.create({
    data: {
      userId,
      companyName: data.companyName || null,
      displayName: data.displayName || null,
      emailFrom: data.emailFrom || null,
      address: data.address || null,
      taxId: data.taxId || null,
      defaultCurrency: data.defaultCurrency || "USD",
      logoUrl: data.logoUrl || null,
      primaryColor: data.primaryColor || null,
      accentColor: data.accentColor || null,
    },
  });
}

export async function updateSenderProfile(userId: string, data: SenderProfileInput) {
  return prisma.senderProfile.update({
    where: { userId },
    data: {
      companyName: data.companyName || null,
      displayName: data.displayName || null,
      emailFrom: data.emailFrom || null,
      address: data.address || null,
      taxId: data.taxId || null,
      defaultCurrency: data.defaultCurrency,
      logoUrl: data.logoUrl || null,
      primaryColor: data.primaryColor || null,
      accentColor: data.accentColor || null,
    },
  });
}

export async function upsertSenderProfile(userId: string, data: SenderProfileInput) {
  return prisma.senderProfile.upsert({
    where: { userId },
    create: {
      userId,
      companyName: data.companyName || null,
      displayName: data.displayName || null,
      emailFrom: data.emailFrom || null,
      address: data.address || null,
      taxId: data.taxId || null,
      defaultCurrency: data.defaultCurrency || "USD",
      logoUrl: data.logoUrl || null,
      primaryColor: data.primaryColor || null,
      accentColor: data.accentColor || null,
    },
    update: {
      companyName: data.companyName || null,
      displayName: data.displayName || null,
      emailFrom: data.emailFrom || null,
      address: data.address || null,
      taxId: data.taxId || null,
      defaultCurrency: data.defaultCurrency,
      logoUrl: data.logoUrl || null,
      primaryColor: data.primaryColor || null,
      accentColor: data.accentColor || null,
    },
  });
}
