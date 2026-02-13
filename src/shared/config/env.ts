import { z } from "zod";

import { EDITIONS } from "./config";

const serverSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(1),
  APP_URL: z.string().min(1).default("http://localhost:3000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  RESEND_API_KEY: z.string().min(1).optional(),
  EMAIL_FROM: z.string().min(1).default("invoices@example.com"),
  ADMIN_EMAIL: z.string().email().optional(),
  SALT_EDGE_APP_ID: z.string().min(1).optional(),
  SALT_EDGE_SECRET: z.string().min(1).optional(),
  SALT_EDGE_BASE_URL: z.string().min(1).default("https://www.saltedge.com/api/v6"),
  CRON_SECRET: z.string().min(1).optional(),
  ENCRYPTION_KEY: z.string().min(32).optional(),
});

const editionSchema = z.enum(EDITIONS).default(EDITIONS[0]);

export type Edition = z.infer<typeof editionSchema>;

const clientSchema = z.object({
  NEXT_PUBLIC_GETPAID_EDITION: editionSchema,
  NEXT_PUBLIC_BANKING_ENABLED: z.boolean(),
});

type ServerEnv = z.infer<typeof serverSchema>;
type ClientEnv = z.infer<typeof clientSchema>;

function readServerRaw(): Record<string, string | undefined> {
  return {
    DATABASE_URL: process.env.DATABASE_URL || undefined,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || undefined,
    APP_URL: process.env.APP_URL || undefined,
    NODE_ENV: process.env.NODE_ENV || undefined,
    RESEND_API_KEY: process.env.RESEND_API_KEY || undefined,
    EMAIL_FROM: process.env.EMAIL_FROM || undefined,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || undefined,
    SALT_EDGE_APP_ID: process.env.SALT_EDGE_APP_ID || undefined,
    SALT_EDGE_SECRET: process.env.SALT_EDGE_SECRET || undefined,
    SALT_EDGE_BASE_URL: process.env.SALT_EDGE_BASE_URL || undefined,
    CRON_SECRET: process.env.CRON_SECRET || undefined,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || undefined,
  };
}

function readClientRaw(): Record<string, unknown> {
  return {
    NEXT_PUBLIC_GETPAID_EDITION: process.env.NEXT_PUBLIC_GETPAID_EDITION || undefined,
    NEXT_PUBLIC_BANKING_ENABLED: process.env.NEXT_PUBLIC_BANKING_ENABLED === "true",
  };
}

function validateServer(): ServerEnv {
  const result = serverSchema.safeParse(readServerRaw());

  if (!result.success) {
    throw new Error(`Invalid server environment variables:\n${result.error.message}`);
  }

  return result.data;
}

function validateClient(): ClientEnv {
  const result = clientSchema.safeParse(readClientRaw());

  if (!result.success) {
    throw new Error(`Invalid client environment variables:\n${result.error.message}`);
  }

  return result.data;
}

const SERVER_KEYS = new Set<string>([
  "DATABASE_URL",
  "NEXTAUTH_SECRET",
  "APP_URL",
  "NODE_ENV",
  "RESEND_API_KEY",
  "EMAIL_FROM",
  "ADMIN_EMAIL",
  "SALT_EDGE_APP_ID",
  "SALT_EDGE_SECRET",
  "SALT_EDGE_BASE_URL",
  "CRON_SECRET",
  "ENCRYPTION_KEY",
]);

let serverCache: ServerEnv | undefined;
let clientCache: ClientEnv | undefined;

type Env = ServerEnv & ClientEnv;

export const env: Env = new Proxy({} as Env, {
  get(_, prop) {
    if (typeof prop !== "string") {
      return undefined;
    }

    if (prop.startsWith("NEXT_PUBLIC_")) {
      if (!clientCache) {
        clientCache = validateClient();
      }

      return clientCache[prop as keyof ClientEnv];
    }

    if (SERVER_KEYS.has(prop)) {
      if (typeof window !== "undefined") {
        throw new Error(`Server env "${prop}" cannot be accessed on the client`);
      }

      if (!serverCache) {
        serverCache = validateServer();
      }

      return serverCache[prop as keyof ServerEnv];
    }

    return undefined;
  },
});
