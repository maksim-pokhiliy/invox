import { prisma } from "@app/server/db";

export async function connectUserStripe(userId: string, stripeAccountId: string) {
  return prisma.senderProfile.upsert({
    where: { userId },
    update: { stripeAccountId },
    create: {
      userId,
      stripeAccountId,
      defaultCurrency: "USD",
    },
  });
}

export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true },
  });

  if (!user) {
    return null;
  }

  const senderProfile = await prisma.senderProfile.findUnique({
    where: { userId },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
    },
    hasSenderProfile: !!senderProfile,
  };
}

export async function disconnectUserStripe(userId: string) {
  const senderProfile = await prisma.senderProfile.findUnique({
    where: { userId },
  });

  if (!senderProfile?.stripeAccountId) {
    return null;
  }

  await prisma.senderProfile.update({
    where: { userId },
    data: { stripeAccountId: null },
  });

  return senderProfile.stripeAccountId;
}
