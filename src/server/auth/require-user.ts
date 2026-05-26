import { asUserId, type UserId } from "@app/shared/types/ids";

import { auth } from "@app/server/auth";

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

  return { id: asUserId(session.user.id), email: session.user.email };
}

export async function getUser(): Promise<AuthUser | null> {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  return { id: asUserId(session.user.id), email: session.user.email };
}
