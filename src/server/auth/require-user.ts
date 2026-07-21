import { asUserId, type UserId } from "@app/shared/types/ids";

import { auth } from "@app/server/auth";
import { prisma } from "@app/server/db";

export interface AuthUser {
  id: UserId;
  email: string;
}

export class AuthenticationError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export async function requireUser(): Promise<AuthUser> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new AuthenticationError();
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true },
  });

  if (!user) {
    throw new AuthenticationError();
  }

  return { id: asUserId(user.id), email: user.email };
}

export async function getUser(): Promise<AuthUser | null> {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true },
  });

  if (!user) {
    return null;
  }

  return { id: asUserId(user.id), email: user.email };
}
