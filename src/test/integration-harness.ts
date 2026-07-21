import type { PrismaClient } from "@prisma/client";
import { readdirSync } from "node:fs";
import { join } from "node:path";

export const TRUNCATE_TABLES = [
  "EmailOutbox",
  "IdempotencyKey",
  "InvoiceTemplateItem",
  "InvoiceTemplateItemGroup",
  "InvoiceTemplate",
  "Payment",
  "InvoiceEvent",
  "InvoiceItem",
  "InvoiceItemGroup",
  "Invoice",
  "Client",
  "Service",
  "SenderProfile",
  "TimeTrackingConnection",
  "VerificationToken",
  "Session",
  "Account",
  "User",
  "WaitlistEntry",
] as const;

const NOT_READY_MESSAGE = "Integration test DB not ready. Run `pnpm test:integration:up` first.";
const TEST_DB_NAME_TOKEN = "test";
const MIGRATIONS_DIR = join(process.cwd(), "prisma", "migrations");
const MIGRATION_DIR_PATTERN = /^\d{14}_/;

export class HarnessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HarnessError";
  }
}

export function resolveExpectedDatabaseName(databaseUrl: string): string {
  let parsed: URL;

  try {
    parsed = new URL(databaseUrl);
  } catch {
    throw new HarnessError(
      `DATABASE_URL_TEST is not a parseable URL. Got: ${describeSafeUrl(databaseUrl)}`
    );
  }

  const dbName = parsed.pathname.replace(/^\//, "");

  if (!dbName) {
    throw new HarnessError(
      `DATABASE_URL_TEST has no database name in its path. Got: ${describeSafeUrl(databaseUrl)}`
    );
  }

  if (!dbName.toLowerCase().includes(TEST_DB_NAME_TOKEN)) {
    throw new HarnessError(
      `DATABASE_URL_TEST database name "${dbName}" does not contain "${TEST_DB_NAME_TOKEN}". ` +
        `Refusing to run integration tests against a database whose name does not signal a test environment.`
    );
  }

  return dbName;
}

function describeSafeUrl(databaseUrl: string): string {
  return databaseUrl.replace(/:\/\/[^@]*@/, "://***@");
}

export async function assertTestDatabase(
  client: PrismaClient,
  expectedDatabaseName: string
): Promise<void> {
  const rows = await client.$queryRaw<Array<{ current_database: string }>>`
    SELECT current_database() AS current_database;
  `;
  const actual = rows[0]?.current_database ?? "";

  if (actual !== expectedDatabaseName) {
    throw new HarnessError(
      `Refusing to run integration tests against database "${actual}". ` +
        `Expected "${expectedDatabaseName}" (parsed from DATABASE_URL_TEST). ` +
        `This safeguard prevents TRUNCATE against a non-test database.`
    );
  }
}

export async function truncateAll(client: PrismaClient): Promise<void> {
  const quoted = TRUNCATE_TABLES.map((table) => `"${table}"`).join(", ");

  await client.$executeRawUnsafe(`TRUNCATE TABLE ${quoted} RESTART IDENTITY CASCADE;`);
}

export function findLatestMigrationOnDisk(): string {
  let entries: string[];

  try {
    entries = readdirSync(MIGRATIONS_DIR);
  } catch {
    throw new HarnessError(
      `Could not read migrations directory at ${MIGRATIONS_DIR}. ` +
        `Integration tests require a prisma/migrations/ directory.`
    );
  }

  const migrationDirs = entries.filter((name) => MIGRATION_DIR_PATTERN.test(name)).sort();
  const latest = migrationDirs.at(-1);

  if (!latest) {
    throw new HarnessError(
      `No migrations found in ${MIGRATIONS_DIR}. ` +
        `Integration tests require at least one applied migration.`
    );
  }

  return latest;
}

export async function verifyMigrationsApplied(client: PrismaClient): Promise<void> {
  const latestOnDisk = findLatestMigrationOnDisk();

  let rows: Array<{ migration_name: string }>;

  try {
    rows = await client.$queryRaw<Array<{ migration_name: string }>>`
      SELECT migration_name
      FROM "_prisma_migrations"
      WHERE migration_name = ${latestOnDisk}
        AND finished_at IS NOT NULL
      LIMIT 1
    `;
  } catch {
    throw new HarnessError(NOT_READY_MESSAGE);
  }

  if (rows.length === 0) {
    throw new HarnessError(
      `Latest migration "${latestOnDisk}" is not applied to the test database. ` +
        `Run \`pnpm test:integration:up\` to apply pending migrations.`
    );
  }
}

export async function disconnectDb(client: PrismaClient): Promise<void> {
  await client.$disconnect();
}
