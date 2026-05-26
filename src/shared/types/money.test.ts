import { describe, expect, expectTypeOf, it } from "vitest";

import {
  applyPercent,
  asCents,
  type Cents,
  fromDollars,
  multiplyCentsByQuantity,
  sumCents,
  toDollars,
} from "./money";

describe("fromDollars", () => {
  it("rounds whole dollars to exact cents", () => {
    expect(fromDollars(100)).toBe(asCents(10_000));
  });

  it("rounds 1.005 to 100 cents because 1.005 * 100 is 100.49999... in IEEE 754", () => {
    expect(fromDollars(1.005)).toBe(asCents(100));
  });

  it("rounds 0.005 to 1 cent because 0.005 * 100 is exactly 0.5 and Math.round(0.5) is 1", () => {
    expect(fromDollars(0.005)).toBe(asCents(1));
  });

  it("rounds 0.004 to 0 cents", () => {
    expect(fromDollars(0.004)).toBe(asCents(0));
  });

  it("rounds -0.125 to -12 cents because Math.round rounds half toward +Infinity", () => {
    expect(fromDollars(-0.125)).toBe(asCents(-12));
  });
});

describe("toDollars", () => {
  it("converts cents back to dollar number", () => {
    expect(toDollars(asCents(12_345))).toBe(123.45);
  });
});

describe("sumCents", () => {
  it("returns 0 for an empty array", () => {
    expect(sumCents([])).toBe(asCents(0));
  });

  it("sums non-empty cents arrays", () => {
    expect(sumCents([asCents(100), asCents(200), asCents(300)])).toBe(asCents(600));
  });
});

describe("applyPercent", () => {
  it("matches percent-discount semantics from calculations", () => {
    expect(applyPercent(asCents(10_000), 20)).toBe(asCents(2_000));
  });
});

describe("multiplyCentsByQuantity", () => {
  it("rounds intermediate floats", () => {
    expect(multiplyCentsByQuantity(asCents(333), 3)).toBe(asCents(999));
  });
});

describe("type contract", () => {
  it("Cents is assignable to number", () => {
    expectTypeOf<Cents>().toMatchTypeOf<number>();
  });

  it("raw number is not assignable to Cents without cast", () => {
    // @ts-expect-error Cents must be constructed via asCents/fromDollars/helpers.
    const x: Cents = 10;

    expect(x).toBe(10);
  });
});
