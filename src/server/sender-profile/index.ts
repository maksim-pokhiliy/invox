import { prisma } from "@app/server/db";
import { SenderProfileInput } from "@app/shared/schemas";

function normalizeProfileData(data: SenderProfileInput, isCreate: boolean) {
  return {
    companyName: data.companyName ?? null,
    displayName: data.displayName ?? null,
    emailFrom: data.emailFrom ?? null,
    address: data.address ?? null,
    taxId: data.taxId ?? null,
    defaultCurrency: isCreate ? (data.defaultCurrency ?? "USD") : data.defaultCurrency,
    logoUrl: data.logoUrl ?? null,
    primaryColor: data.primaryColor ?? null,
    accentColor: data.accentColor ?? null,
    footerText: data.footerText ?? null,
    fontFamily: data.fontFamily ?? null,
    invoicePrefix: data.invoicePrefix ?? null,
    defaultRate: data.defaultRate ?? null,
  };
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
      ...normalizeProfileData(data, true),
    },
  });
}

export async function updateSenderProfile(userId: string, data: SenderProfileInput) {
  return prisma.senderProfile.update({
    where: { userId },
    data: normalizeProfileData(data, false),
  });
}

export async function upsertSenderProfile(userId: string, data: SenderProfileInput) {
  const createData = normalizeProfileData(data, true);
  const updateData = normalizeProfileData(data, false);

  return prisma.senderProfile.upsert({
    where: { userId },
    create: { userId, ...createData },
    update: updateData,
  });
}
