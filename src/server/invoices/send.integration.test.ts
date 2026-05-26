import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import {
  EMAIL_OUTBOX_KIND,
  EMAIL_OUTBOX_RELATED_TYPE,
  EMAIL_OUTBOX_STATUS,
} from "@app/shared/config/email-outbox";
import { INVOICE_EVENT, INVOICE_STATUS } from "@app/shared/config/invoice-status";
import { asInvoiceId, asUserId } from "@app/shared/types/ids";

const sendEmailMock = vi.fn().mockResolvedValue({ data: { id: "fake-resend-id" }, error: null });
const randomUUIDMock = vi.fn();

vi.mock("@app/server/email", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@app/server/email")>();

  return { ...actual, sendEmail: sendEmailMock };
});

vi.mock("node:crypto", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:crypto")>();

  return { ...actual, randomUUID: randomUUIDMock };
});

const { prisma } = await import("@app/server/db");
const { buildOutboxIdempotencyKey } = await import("@app/server/email/outbox");
const { InvoiceAlreadySentError, InvoiceNotFoundError, sendInvoice } =
  await import("@app/server/invoices/send");
const factories = await import("@app/test/factories");
const actualCrypto = await vi.importActual<typeof import("node:crypto")>("node:crypto");

const TOTAL_CENTS = 12_000;
const PLACEHOLDER_KEY_PREFIX = "pending-";
const FROZEN_RANDOM_UUID = "00000000-0000-4000-8000-000000000001";

interface SendInvoiceContext {
  invoiceId: ReturnType<typeof asInvoiceId>;
  userId: ReturnType<typeof asUserId>;
  ownerEmail: string;
  clientEmail: string;
}

async function seedSendableInvoice(
  status: (typeof INVOICE_STATUS)[keyof typeof INVOICE_STATUS] = INVOICE_STATUS.DRAFT
): Promise<SendInvoiceContext> {
  const user = await factories.createUser(prisma);

  await factories.createSenderProfile(prisma, { userId: user.id });

  const client = await factories.createClient(prisma, { userId: user.id });
  const invoice = await factories.createInvoice(prisma, {
    userId: user.id,
    clientId: client.id,
    status,
    subtotal: TOTAL_CENTS,
    taxAmount: 0,
    total: TOTAL_CENTS,
  });

  return {
    invoiceId: asInvoiceId(invoice.id),
    userId: asUserId(user.id),
    ownerEmail: user.email,
    clientEmail: client.email,
  };
}

let consoleError: ReturnType<typeof vi.spyOn> | undefined;

beforeAll(() => {
  consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
});

beforeEach(() => {
  sendEmailMock.mockClear();
  consoleError?.mockClear();
  randomUUIDMock.mockReset();
  randomUUIDMock.mockImplementation(() => actualCrypto.randomUUID());
});

afterAll(() => {
  consoleError?.mockRestore();
});

describe("sendInvoice happy path", () => {
  it("flips DRAFT to SENT, writes a PENDING outbox row, and does not call sendEmail inside the transaction", async () => {
    const ctx = await seedSendableInvoice();

    const result = await sendInvoice(ctx.invoiceId, ctx.userId);

    expect(result.outboxId).toMatch(/.+/);

    const invoice = await prisma.invoice.findUniqueOrThrow({ where: { id: ctx.invoiceId } });

    expect(invoice.status).toBe(INVOICE_STATUS.SENT);
    expect(invoice.sentAt).not.toBeNull();
    expect(invoice.paymentReference).not.toBeNull();

    const events = await prisma.invoiceEvent.findMany({
      where: { invoiceId: ctx.invoiceId, type: INVOICE_EVENT.SENT },
    });

    expect(events).toHaveLength(1);

    const outboxRow = await prisma.emailOutbox.findUniqueOrThrow({
      where: { id: result.outboxId },
    });

    expect(outboxRow.status).toBe(EMAIL_OUTBOX_STATUS.PENDING);
    expect(outboxRow.kind).toBe(EMAIL_OUTBOX_KIND.INVOICE);
    expect(outboxRow.relatedId).toBe(ctx.invoiceId);

    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it("rewrites the placeholder idempotencyKey to the stable buildOutboxIdempotencyKey value inside the transaction", async () => {
    const ctx = await seedSendableInvoice();

    const result = await sendInvoice(ctx.invoiceId, ctx.userId);

    const outboxRow = await prisma.emailOutbox.findUniqueOrThrow({
      where: { id: result.outboxId },
    });

    const expectedStableKey = buildOutboxIdempotencyKey(
      EMAIL_OUTBOX_KIND.INVOICE,
      ctx.invoiceId,
      result.outboxId
    );

    expect(outboxRow.idempotencyKey).toBe(expectedStableKey);
    expect(outboxRow.idempotencyKey.startsWith(PLACEHOLDER_KEY_PREFIX)).toBe(false);
  });
});

describe("sendInvoice rejected status transitions", () => {
  it("rejects a non-DRAFT invoice with InvoiceAlreadySentError and writes no outbox row, no event, no status change", async () => {
    const ctx = await seedSendableInvoice(INVOICE_STATUS.PAID);

    await expect(sendInvoice(ctx.invoiceId, ctx.userId)).rejects.toBeInstanceOf(
      InvoiceAlreadySentError
    );

    const invoice = await prisma.invoice.findUniqueOrThrow({ where: { id: ctx.invoiceId } });

    expect(invoice.status).toBe(INVOICE_STATUS.PAID);
    expect(invoice.sentAt).toBeNull();
    expect(invoice.paymentReference).toBeNull();

    const events = await prisma.invoiceEvent.count({ where: { invoiceId: ctx.invoiceId } });

    expect(events).toBe(0);

    const outboxRows = await prisma.emailOutbox.count({ where: { relatedId: ctx.invoiceId } });

    expect(outboxRows).toBe(0);
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it("rejects an invoice that belongs to another user with InvoiceNotFoundError and writes nothing", async () => {
    const ctx = await seedSendableInvoice();
    const intruder = await factories.createUser(prisma);

    await expect(sendInvoice(ctx.invoiceId, asUserId(intruder.id))).rejects.toBeInstanceOf(
      InvoiceNotFoundError
    );

    const invoice = await prisma.invoice.findUniqueOrThrow({ where: { id: ctx.invoiceId } });

    expect(invoice.status).toBe(INVOICE_STATUS.DRAFT);
    expect(invoice.sentAt).toBeNull();

    const events = await prisma.invoiceEvent.count({ where: { invoiceId: ctx.invoiceId } });

    expect(events).toBe(0);

    const outboxRows = await prisma.emailOutbox.count({ where: { relatedId: ctx.invoiceId } });

    expect(outboxRows).toBe(0);
    expect(sendEmailMock).not.toHaveBeenCalled();
  });
});

describe("sendInvoice transactional guarantees", () => {
  it("rolls back the entire transaction when the outbox placeholder INSERT collides with the @@unique constraint", async () => {
    randomUUIDMock.mockReturnValue(FROZEN_RANDOM_UUID);

    const ctx = await seedSendableInvoice();
    const collidingKey = `${PLACEHOLDER_KEY_PREFIX}${FROZEN_RANDOM_UUID}`;

    await factories.createEmailOutbox(prisma, {
      userId: ctx.userId,
      kind: EMAIL_OUTBOX_KIND.INVOICE,
      relatedType: EMAIL_OUTBOX_RELATED_TYPE.INVOICE,
      relatedId: ctx.invoiceId,
      idempotencyKey: collidingKey,
    });

    await expect(sendInvoice(ctx.invoiceId, ctx.userId)).rejects.toMatchObject({ code: "P2002" });

    const invoice = await prisma.invoice.findUniqueOrThrow({ where: { id: ctx.invoiceId } });

    expect(invoice.status).toBe(INVOICE_STATUS.DRAFT);
    expect(invoice.sentAt).toBeNull();
    expect(invoice.paymentReference).toBeNull();

    const events = await prisma.invoiceEvent.count({ where: { invoiceId: ctx.invoiceId } });

    expect(events).toBe(0);

    const outboxRowsForInvoice = await prisma.emailOutbox.findMany({
      where: { relatedId: ctx.invoiceId },
    });

    expect(outboxRowsForInvoice).toHaveLength(1);
    expect(outboxRowsForInvoice[0].idempotencyKey).toBe(collidingKey);
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it("under concurrent calls writes at most one PENDING outbox row per invoice", async () => {
    const ctx = await seedSendableInvoice();

    const settled = await Promise.allSettled([
      sendInvoice(ctx.invoiceId, ctx.userId),
      sendInvoice(ctx.invoiceId, ctx.userId),
    ]);

    const fulfilled = settled.filter((r) => r.status === "fulfilled");
    const rejected = settled.filter((r) => r.status === "rejected");

    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);
    expect((rejected[0] as PromiseRejectedResult).reason).toBeInstanceOf(InvoiceAlreadySentError);

    const outboxRows = await prisma.emailOutbox.findMany({
      where: { relatedId: ctx.invoiceId, kind: EMAIL_OUTBOX_KIND.INVOICE },
    });

    expect(outboxRows.length).toBe(1);

    const invoice = await prisma.invoice.findUniqueOrThrow({ where: { id: ctx.invoiceId } });

    expect(invoice.status).toBe(INVOICE_STATUS.SENT);
    expect(sendEmailMock).not.toHaveBeenCalled();
  });
});
