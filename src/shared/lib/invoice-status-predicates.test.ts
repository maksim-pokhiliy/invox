import { describe, expect, it } from "vitest";

import { INVOICE_STATUS } from "@app/shared/config/invoice-status";

import { isOverdue } from "./invoice-status-predicates";

const NOW = new Date("2026-05-26T12:00:00.000Z");
const YESTERDAY = new Date("2026-05-25T12:00:00.000Z");
const TOMORROW = new Date("2026-05-27T12:00:00.000Z");

describe("isOverdue", () => {
  it("returns false for a DRAFT invoice even when the due date is in the past", () => {
    expect(isOverdue({ status: INVOICE_STATUS.DRAFT, dueDate: YESTERDAY, paidAt: null }, NOW)).toBe(
      false
    );
  });

  it("returns false for a fully paid invoice past the due date", () => {
    expect(
      isOverdue({ status: INVOICE_STATUS.PAID, dueDate: YESTERDAY, paidAt: YESTERDAY }, NOW)
    ).toBe(false);
  });

  it("returns false when the due date is in the future", () => {
    expect(isOverdue({ status: INVOICE_STATUS.SENT, dueDate: TOMORROW, paidAt: null }, NOW)).toBe(
      false
    );
  });

  it("returns false when the due date is exactly now (strict less-than comparison)", () => {
    expect(isOverdue({ status: INVOICE_STATUS.SENT, dueDate: NOW, paidAt: null }, NOW)).toBe(false);
  });

  it("returns true for an unpaid non-draft invoice past the due date", () => {
    expect(isOverdue({ status: INVOICE_STATUS.SENT, dueDate: YESTERDAY, paidAt: null }, NOW)).toBe(
      true
    );
  });

  it("returns false when paidAt is set even if the due date is in the past", () => {
    expect(
      isOverdue({ status: INVOICE_STATUS.SENT, dueDate: YESTERDAY, paidAt: YESTERDAY }, NOW)
    ).toBe(false);
  });
});
