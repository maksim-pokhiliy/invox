import { CURRENCY } from "@app/shared/config/config";
import type { Branded } from "@app/shared/types/ids";

export type Cents = Branded<number, "Cents">;

export function asCents(n: number): Cents {
  return n as Cents;
}

export function fromDollars(dollars: number): Cents {
  return Math.round(dollars * CURRENCY.CENTS_MULTIPLIER) as Cents;
}

export function toDollars(c: Cents): number {
  return c / CURRENCY.CENTS_MULTIPLIER;
}

export function addCents(a: Cents, b: Cents): Cents {
  return (a + b) as Cents;
}

export function subtractCents(a: Cents, b: Cents): Cents {
  return (a - b) as Cents;
}

export function sumCents(values: readonly Cents[]): Cents {
  return values.reduce<number>((acc, v) => acc + v, 0) as Cents;
}

export function multiplyCentsByQuantity(price: Cents, quantity: number): Cents {
  return Math.round(price * quantity) as Cents;
}

export function applyPercent(base: Cents, percent: number): Cents {
  return Math.round((base * percent) / 100) as Cents;
}

export function clampNonNegative(c: Cents): Cents {
  return c < 0 ? (0 as Cents) : c;
}
