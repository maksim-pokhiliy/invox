import { prisma } from "@app/server/db";

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
