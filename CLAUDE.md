# CLAUDE.md - Development Guidelines for GetPaid

This file provides guidance for Claude Code when working on the GetPaid project.

## Project Overview

GetPaid is an invoice management MVP built with Next.js, MUI, Prisma, and NextAuth.

## Architecture Rules (DO NOT BREAK)

### Feature-Sliced Design (FSD)

This project follows Feature-Sliced Design architecture strictly.

```
src/
├── app/              # ONLY Next.js routing (page.tsx, layout.tsx, route.ts)
├── features/         # Domain-specific vertical slices
│   └── {feature}/
│       ├── api/      # API client functions
│       ├── hooks/    # React Query hooks
│       ├── components/
│       ├── schemas/  # Zod schemas
│       └── constants/
├── shared/           # Shared across features
│   ├── api/          # Base API client
│   ├── config/       # App configuration, constants
│   ├── hooks/        # Shared hooks
│   ├── lib/          # Utilities (format, export)
│   ├── ui/           # UI components (buttons, dialogs, etc.)
│   └── layout/       # Layout components
├── providers/        # React context providers
└── server/           # Server-side services (Prisma access)
```

### STRICT Rules

1. **`src/app/` is for routing only**
   - Allowed files: `page.tsx`, `layout.tsx`, `route.ts`, `loading.tsx`, `error.tsx`, `not-found.tsx`
   - NO utilities, NO business logic, NO domain components
   - **One exception:** colocated `*-client.tsx` files are allowed when a Server Component must split out an interactive client wrapper (e.g. `app/(main)/waitlist/page-client.tsx`). The wrapper must be a thin shell that delegates to a real component in `src/features/` or `src/shared/ui/`. No business logic in the wrapper.

2. **All file names MUST be in kebab-case**
   - `invoice-dialogs.tsx` NOT `InvoiceDialogs.tsx`
   - `use-invoice.ts` NOT `useInvoice.ts`
   - Exception: Next.js reserved files (page.tsx, layout.tsx, route.ts)

3. **Layer boundaries are sacred**
   - Features NEVER import from other features directly
   - Shared NEVER imports from features
   - UI components NEVER import Prisma
   - Only `src/server/` can access Prisma

4. **No magic strings or numbers in server / shared/lib / shared/api code**
   - All constants in `shared/config/` or feature `constants/`
   - Use enums or const objects for repeated values
   - MUI `sx`/Grid layout literals and theme tokens are exempt (positional design values, not magic)

5. **No code comments except JSDoc**
   - Code should be self-documenting
   - Use meaningful names instead of comments
   - Exception: JSDoc for public APIs

6. **MUI consistency**
   - Use MUI components everywhere
   - No custom CSS unless absolutely necessary
   - Use `sx` prop for styling
   - Use theme values (spacing, colors, typography)

7. **No duplication**
   - DRY principle strictly enforced
   - Extract shared logic to `shared/`
   - Extract shared UI to `shared/ui/`

### API Layer (`/src/app/api/*`)

- Route handlers only
- Call server services for business logic
- Validate inputs with Zod schemas
- Wrap handlers in `withAuth` / `withAdmin` (see [Canonical Route Patterns](#canonical-route-patterns) below) — never call `requireUser()` directly in a route
- Return standardized error format: `{ error: { code, message } }`

### Canonical Route Patterns

Every route in `src/app/api/*` is composed from the helpers in `src/server/api/route-helpers.ts`. Use them — do not reinvent auth, body parsing, or error shapes per route.

**Authenticated route:**

```typescript
import { parseBody, withAuth } from "@app/server/api/route-helpers";

import { createInvoiceSchema } from "@app/shared/schemas";
import { createInvoice } from "@app/server/invoices";

export const POST = withAuth(async (user, request) => {
  const { data, error } = await parseBody(request, createInvoiceSchema);
  if (error) return error;

  const invoice = await createInvoice(user.id, data);
  return NextResponse.json(invoice, { status: 201 });
});
```

**Admin-only route** (gated by `ADMIN_EMAIL` env, used for waitlist-admin endpoints):

```typescript
import { withAdmin } from "@app/server/api/route-helpers";

export const POST = withAdmin(async (user, request, context) => {
  return NextResponse.json({ ok: true });
});
```

**Idempotent write** (compose with `withAuth`):

```typescript
import { withIdempotency } from "@app/server/api/idempotency";
import { withAuth } from "@app/server/api/route-helpers";

export const POST = withAuth(
  withIdempotency(handler, { endpoint: "POST /api/invoices/:id/payments" })
);
```

**Helper inventory** (`src/server/api/route-helpers.ts`):

- `withAuth(handler, errorHandlers?)` — verifies session, surfaces `UNAUTHORIZED` (401) on failure, dispatches custom `errorHandlers` (e.g. domain-error → 400) before falling back to `INTERNAL_ERROR` (500).
- `withAdmin(handler, errorHandlers?)` — `withAuth` plus `env.ADMIN_EMAIL` check; non-admins get `FORBIDDEN` (403).
- `parseBody(request, schema)` — returns `{ data, error: null }` on success or `{ data: never, error: NextResponse }` (400 `VALIDATION_ERROR`) on Zod failure. Always early-return `error`.
- `errorResponse(code, message, status, details?)` — manual error responses when none of the helpers fit.
- `unauthorizedResponse()`, `forbiddenResponse()`, `notFoundResponse(entity)`, `validationErrorResponse(zodError)`, `internalErrorResponse()` — shorthand for the common shapes.

**Standard error response shape** (set by `errorResponse`, never deviate):

```json
{ "error": { "code": "BAD_REQUEST", "message": "Payment exceeds invoice total" } }
```

### Service Layer (`/src/server/*`)

- Business logic lives here
- Direct Prisma access allowed
- Services are organized by domain

### Authentication

- Always use NextAuth (Auth.js)
- Protected API routes wrap handlers with `withAuth` / `withAdmin` (see [Canonical Route Patterns](#canonical-route-patterns)). Server Components / RSC can call `requireUser()` directly.
- Session user includes `id` and `email`
- JWT strategy with database user lookup

### Public vs Internal IDs

- Public pages use `publicId` (nanoid)
- NEVER expose internal `id` to public URLs
- Internal routes can use `id`

## Common Commands

```bash
pnpm dev                    # Start dev server
pnpm build                  # Production build
pnpm lint                   # Run ESLint
pnpm typecheck              # TypeScript checking
pnpm format                 # Format with Prettier
pnpm test                   # Run unit tests only (vitest --project=unit)
pnpm test:watch             # Run unit tests in watch mode
pnpm test:integration       # Run integration tests (requires Postgres + DATABASE_URL_TEST)
pnpm test:integration:up    # Boot test Postgres (docker-compose.test.yml) + apply migrations
pnpm test:integration:down  # Tear down test Postgres (data is wiped — tmpfs)
pnpm db:migrate             # prisma migrate dev — local schema iteration
pnpm db:migrate:deploy      # prisma migrate deploy — apply migrations to a target DB (CI / prod)
pnpm db:studio              # Open Prisma Studio
```

## Testing

Two test tiers, run independently. `pnpm test` is scoped to the unit project — it does NOT run integration tests.

### Tiers and conventions

- **Unit tests** — `*.test.ts`, colocated with source. Mock Prisma at the module boundary via `vi.mock("@app/server/db", …)`. No DB required, sub-second suite.
- **Integration tests** — `*.integration.test.ts`, colocated with source. Import `prisma` from `@app/server/db` directly; hit a real Postgres. Tables are TRUNCATEd between every test (`src/test/setup-integration.ts`).
- **Factories** — `src/test/factories/<model>.ts`, re-exported from the barrel `@app/test/factories`. Each model exposes `make<X>(overrides?)` (pure object builder, for unit tests) and `create<X>(prisma, overrides?)` (writes to DB, returns the row — for integration tests).

When to write integration vs unit:

- Integration — anything that exercises real DB CHECK constraints, `@@unique` constraints, `prisma.$transaction` semantics, or concurrent writes. The atomicity / claim-before-handler / paid-vs-total guards are provably untestable with mocks.
- Unit — pure logic (calculators, schema parsers, format helpers, mock-friendly state machines).

### Running integration tests locally

1. `DATABASE_URL_TEST="postgresql://postgres:postgres@localhost:5434/getpaid_test"` in `.env` (see `.env.example`).
2. `pnpm test:integration:up` — boots `postgres:16-alpine` on host port `5434` via `docker-compose.test.yml` and runs `prisma migrate deploy` against it. Storage is `tmpfs`, so data is wiped on every `down`.
3. `pnpm test:integration` — runs the suite.
4. `pnpm test:integration:down` when finished.

### Safety: harness refuses to wipe non-test DBs

`DATABASE_URL_TEST` is REQUIRED — the harness throws on startup if it's unset. The harness parses the database name from the URL, asserts it contains the substring `"test"` (case-insensitive), and cross-checks it against Postgres' `SELECT current_database()` before issuing TRUNCATE. A misconfigured shell pointing at prod cannot wipe it: the name predicate fires first. `DATABASE_URL_TEST` is operator-facing only and is intentionally NOT in `src/shared/config/env.ts`.

### CI

`.github/workflows/integration.yml` runs the integration suite on every PR that touches server/test paths (see the workflow's `paths` for the exact list). It spins up a fresh Postgres 16 service, applies migrations, then runs `pnpm test:integration`.

See `docs/runbooks/testing.md` for the operator-side runbook (first-time setup, failure modes, single-file invocation).

## Database migrations

Schema changes are tracked via Prisma migration files under `prisma/migrations/` and committed to git. Production never runs `prisma db push` — `db push` is for throwaway dev work only.

**Local workflow:**

1. Edit `prisma/schema.prisma`.
2. `pnpm db:migrate -- --name <change-summary>` generates `prisma/migrations/<ts>_<change>/migration.sql`.
3. Review the SQL — must be lossless (no `DROP COLUMN`, no `DROP TABLE`, no `ALTER COLUMN TYPE` without a backfill plan). If destructive, follow expand-then-contract.
4. Commit migration files alongside the code change.

**Production (Vercel) deploy:**

- Vercel does NOT run migrations on deploy.
- **Additive / backward-compatible migration** (new table or column — the common case): apply the migration BEFORE merging — `DATABASE_URL=$PROD pnpm db:migrate:deploy` (after a `pg_dump` backup) — then merge → Vercel rebuilds → the new code sees the migrated schema.
- **Destructive migration** (`DROP TABLE` / `DROP COLUMN` / `DROP TYPE`): reverse the order. Merge first → wait for Vercel to redeploy the code that no longer references the dropped objects → only THEN apply the migration (`pg_dump` backup first). Applying a destructive drop while the old code is still live breaks it — the old code queries objects that no longer exist.

**Self-host (Docker):**

- Container `CMD` runs `prisma migrate deploy` on every start. Pending migrations apply automatically when the container boots.

## File Naming Convention

```
# Components
shared/ui/confirm-dialog.tsx
features/invoices/components/invoice-row.tsx

# Hooks
shared/hooks/use-autosave.ts
features/invoices/hooks/use-invoice.ts

# Schemas
shared/schemas/invoice.ts

# API
features/invoices/api/index.ts

# Constants
shared/config/constants.ts
features/invoices/constants/status.ts
```

## Adding New Features

1. Create feature directory in `/src/features/{feature}/`
2. Define Zod schema in `schemas/`
3. Create API client in `api/`
4. Create React Query hooks in `hooks/`
5. Build components in `components/`
6. Create server service in `/src/server/{feature}/`
7. Add API route in `/src/app/api/{feature}/route.ts`
8. Add page in `/src/app/{path}/page.tsx`

## Editions & Feature Flags

Controlled by `NEXT_PUBLIC_GETPAID_EDITION` env variable. Editions and their names are defined in `EDITIONS` constant (`shared/config/config.ts`). Feature flags are derived from the edition in `shared/config/features.ts`.

| Feature              | `community` (default) | `pro` |
| -------------------- | --------------------- | ----- |
| `publicRegistration` | true                  | false |
| `waitlistAdmin`      | false                 | true  |

- `community` — self-hosted, open registration
- `pro` — managed hosted instance, invite-only

To add a new feature flag:

1. Add field to `FeatureFlags` interface in `shared/config/features.ts`
2. Set values for each edition in `EDITION_FEATURES`
3. Use `features.yourFlag` in code

## Invoice Status Flow

```
DRAFT -> SENT (on send)
SENT -> VIEWED (on first view)
VIEWED/SENT -> OVERDUE (computed if dueDate < now)
Any -> PAID (manual payment recording)
Any -> PARTIALLY_PAID (partial payment recorded)
```

## Error Handling

API responses follow this format:

```typescript
// Success — routes return the resource (or list) directly; action acks return { success: true }
{ id, name, ... }      // entity
[ { ... }, { ... } ]   // list
{ success: true }      // mutation ack with no resource

// Error — always enveloped via errorResponse()
{
  error: {
    code: "ERROR_CODE",
    message: "Human readable message"
  }
}
```

Response shapes for every endpoint live in Zod schemas under `src/shared/schemas/api.ts` (resource schemas plus the action acks `successAckSchema` / `messageAckSchema`). The TypeScript types each feature consumes are `z.infer<typeof schema>` — that schema is the single source of truth for the wire shape.

Client-side feature API methods pass the matching schema to `fetchApi` as the third argument so a wire-shape drift fails loudly at the client boundary instead of silently producing a mistyped object:

```typescript
import { fetchApi } from "@app/shared/api/base";
import { invoiceSchema, type Invoice } from "@app/shared/schemas/api";

export const invoicesApi = {
  get: (id: string) => fetchApi<Invoice>(`/api/invoices/${id}`, undefined, invoiceSchema),
};
```

If the response doesn't match the schema, `fetchApi` logs a structured `api.response.shape_mismatch` line via `console.error` and throws `ApiResponseShapeError` — surfaced to React Query as a query/mutation error, not swallowed.

Common error codes (full canonical inventory in `src/shared/api/error-codes.ts` — `API_ERROR_CODES`):

- `VALIDATION_ERROR` - Invalid input (Zod parse failed)
- `BAD_REQUEST` - Well-formed input but business rule rejected (e.g. payment over invoice total)
- `UNAUTHORIZED` - Not authenticated (session missing or expired)
- `FORBIDDEN` - Authenticated but not allowed (e.g. non-admin hitting `withAdmin` route)
- `NOT_FOUND` - Resource not found or not owned by the caller
- `EMAIL_EXISTS` - Sign-up attempted with an email that already has an account
- `REGISTRATION_DISABLED` - Sign-up blocked by edition (`pro` rejects public registration)
- `IDEMPOTENCY_KEY_REQUIRED` / `IDEMPOTENCY_KEY_INVALID` / `IDEMPOTENCY_KEY_REUSED` / `IDEMPOTENCY_KEY_IN_PROGRESS` - Idempotency-Key header issues (see Idempotency below)
- `ALREADY_SENT` - Invoice send re-attempt after it already moved past DRAFT
- `CLIENT_HAS_DEPENDENTS` - Client deletion blocked because invoices reference it
- `PAYMENT_EXCEEDS_BALANCE` - Payment amount greater than the invoice's outstanding balance
- `CONNECTION_DECRYPT_FAILED` - Stored time-tracking OAuth token failed AES-GCM decrypt (key rotation or tampering)
- `RATE_LIMITED` - Per-route per-user request budget exhausted
- `GATEWAY_TIMEOUT` - Route handler exceeded the configured request timeout
- `UPSTREAM_NOT_FOUND` / `UPSTREAM_BAD_REQUEST` / `UPSTREAM_UNAUTHORIZED` / `UPSTREAM_RATE_LIMITED` / `UPSTREAM_ERROR` - Third-party time-tracking API (Toggl) returned 404 / 400 / 401 / 429 / 5xx respectively
- `INTERNAL_ERROR` - Unexpected server error

## Idempotency

State-changing endpoints with money / data-creation impact require an `Idempotency-Key` header to prevent double-writes (browser refresh, retries, double-click).

Pattern:

```typescript
import { withIdempotency } from "@app/server/api/idempotency";
import { withAuth } from "@app/server/api/route-helpers";

export const POST = withAuth(
  withIdempotency(handler, { endpoint: "POST /api/invoices/:id/payments" })
);
```

Server enforcement (today):

- `POST /api/invoices` (create invoice)
- `POST /api/invoices/:id/payments` (record payment)
- `POST /api/invoices/:id/send` (send invoice email + outbox row)
- `POST /api/invoices/:id/mark-paid` (mark invoice paid)
- `POST /api/invoices/:id/duplicate` (clone invoice)

Behavior:

- Missing header on enforced routes -> `400 IDEMPOTENCY_KEY_REQUIRED`.
- Same key + same body within 24h -> cached `(status, body)` returned.
- Same key + different body within 24h -> `422 IDEMPOTENCY_KEY_REUSED`.
- Key validation: 8-128 printable ASCII chars, else `400 IDEMPOTENCY_KEY_INVALID`.
- The key row is claimed (inserted with an empty response) BEFORE the handler runs, so the unique constraint serializes concurrent same-key requests — only the INSERT winner executes the handler. A concurrent same-key request that loses the INSERT while the winner is still in flight gets `409 IDEMPOTENCY_KEY_IN_PROGRESS` (retryable) and never re-runs the handler. If the handler throws, the claim row is deleted so the key stays retryable.

Frontend convention: React Query mutations call `generateIdempotencyKey()` from `@app/shared/api/idempotency-key` per submit (one fresh UUID per user action). Pass it through the API client; the API client puts it into `Idempotency-Key` via `idempotencyHeader()`.

When adding a new write endpoint that creates resources, charges money, or sends external messages: wrap with `withIdempotency` and have the caller supply a fresh key.

## Email Outbox

Outbound email is sent via the transactional outbox pattern: a state-change writes the DB row(s) AND an `EmailOutbox` row in the same `prisma.$transaction`; the actual Resend call happens AFTER the transaction commits. This guarantees a partial failure can never leave the system thinking an email was sent when it wasn't (or vice versa).

Pattern:

```typescript
const outboxId = await prisma.$transaction(async (tx) => {
  await updateInvoiceStatus(invoice.id, INVOICE_STATUS.SENT, { sentAt }, tx);
  await logInvoiceEvent(invoice.id, INVOICE_EVENT.SENT, {}, tx);

  const row = await createStableOutbox(tx, {
    userId,
    kind: EMAIL_OUTBOX_KIND.INVOICE,
    relatedType: EMAIL_OUTBOX_RELATED_TYPE.INVOICE,
    relatedId: invoice.id,
    payload,
  });

  return row.id;
});

await dispatchOutbox(outboxId);
```

`createStableOutbox` (in `@app/server/email/outbox`) handles the two-step write internally: it inserts the row with a unique placeholder idempotency key (`pending-<uuid>`) to satisfy the NOT NULL + `@@unique` constraints before `row.id` is known, then rewrites it to the stable `buildOutboxIdempotencyKey(kind, relatedId, row.id)` value — all inside the caller's transaction. Use it for every new outbox flow; the lower-level `createEmailOutbox` exists only as the building block underneath.

Key rules:

- The DB writes that change user-visible state and the `createStableOutbox` call MUST be in the same `prisma.$transaction`. Email payload is captured (rendered HTML/text) inside the transaction so a template change between send and retry can't desync.
- The Resend call lives in `dispatchOutbox(rowId)` and happens AFTER the transaction commits. Best-effort: if Resend fails, the outbox row stays `PENDING` and `scripts/process-outbox.ts` (cron entry, `pnpm outbox:run`) retries with exponential backoff (5min × 2^attempts up to 5 attempts, then `FAILED`).
- `dispatchOutbox` calls `sendEmail()` from `@app/server/email` with `idempotencyKey` set to the row's stable key (`${kind}-${relatedId}-${outboxRowId}`). Resend's per-call idempotency dedupes the actual API call across retries.
- Two flows currently use the outbox: `sendInvoice` and the waitlist routes (sign-up + admin approval).

When adding a new email-send: build a `ResendEmailPayload` via a `buildXxxEmailPayload` helper in `@app/server/email`, then write the state change + `createStableOutbox` in one transaction, then `dispatchOutbox` outside.

## Background maintenance

`pnpm prune:expired` (`scripts/prune-expired.ts`) deletes rows whose lifecycle has ended but for which no code path performs the cleanup: expired `IdempotencyKey` rows (predicate `expiresAt <= now`, matching `withIdempotency`'s read-side staleness check), `EmailOutbox` rows older than `EMAIL_OUTBOX.RETENTION_SENT_DAYS = 30` (status `SENT`) or `EMAIL_OUTBOX.RETENTION_FAILED_DAYS = 90` (status `FAILED`), and orphan `WaitlistEntry` rows whose email already matches a `User` row, older than `WAITLIST.ORPHAN_RETENTION_DAYS = 90`. Constants live in `src/shared/config/{email-outbox,waitlist,prune}.ts`; retention is intentionally hardcoded (no env override) so a typo cannot wipe a table from a shell.

Today the prune is operator-invoked (manual `pnpm prune:expired`); REL-001 will wire it onto a daily cron next to `outbox:run`. Pass `--dry-run` to count without deleting — the predicates are identical to the live path, so the count is the exact preview (the waitlist arm short-circuits the `User`-join and returns an upper bound). The orchestrator uses Postgres `NOW()` so the operator's machine clock is irrelevant. Exit code is `0` only when every table succeeds, `1` when any sub-prune throws (the failure is recorded per-table in the JSON summary; other tables still run). Each table emits a `prune.<table>.complete` JSON line plus a final `prune.run.summary`; deletes larger than `PRUNE.LARGE_DELETE_THRESHOLD = 50_000` also emit a `prune.warning.large_delete` line so backlog growth is visible in cron logs. See `docs/runbooks/cron.md` for the operator runbook (always dry-run first on prod).

## Code Quality Checklist

Before committing, verify:

- [ ] No components in `src/app/` (only routing files)
- [ ] All files in kebab-case
- [ ] No magic strings/numbers
- [ ] No code comments (only JSDoc if needed)
- [ ] No cross-feature imports
- [ ] No Prisma imports outside `src/server/`
- [ ] No duplicate code
- [ ] MUI components used consistently
- [ ] TypeScript strict mode passes
- [ ] ESLint passes
