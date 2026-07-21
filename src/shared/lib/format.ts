import { CURRENCY } from "@app/shared/config/config";
import { CURRENCY_SYMBOLS } from "@app/shared/config/currencies";
import { type Cents } from "@app/shared/types/money";

function formatWithSymbol(amount: number, currency: string, fractionDigits: number): string {
  const value = amount / CURRENCY.CENTS_MULTIPLIER;

  return `${value.toLocaleString("en-US", { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits })} ${CURRENCY_SYMBOLS[currency]}`;
}

export function formatCurrency(amount: number, currency = "USD"): string {
  if (CURRENCY_SYMBOLS[currency]) {
    return formatWithSymbol(amount, currency, 2);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount / CURRENCY.CENTS_MULTIPLIER);
}

export function formatCurrencyCompact(amount: number, currency = "USD"): string {
  if (CURRENCY_SYMBOLS[currency]) {
    return formatWithSymbol(amount, currency, 0);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount / CURRENCY.CENTS_MULTIPLIER);
}

export function formatCents(amount: Cents, currency = "USD"): string {
  return formatCurrency(amount, currency);
}

export function formatCentsCompact(amount: Cents, currency = "USD"): string {
  return formatCurrencyCompact(amount, currency);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

export function formatDateCompact(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

export function formatDateShort(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(d);
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}
