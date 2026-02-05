import bcrypt from "bcryptjs";
import { prisma } from "@app/server/db";
import { AUTH } from "@app/lib/constants";

export class EmailExistsError extends Error {
  constructor() {
    super("An account with this email already exists");
    this.name = "EmailExistsError";
  }
}

export async function createUser(email: string, password: string): Promise<void> {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new EmailExistsError();
  }

  const passwordHash = await bcrypt.hash(password, AUTH.BCRYPT_ROUNDS);

  await prisma.user.create({
    data: {
      email,
      passwordHash,
    },
  });
}
