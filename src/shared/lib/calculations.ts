import {
  DISCOUNT_NONE,
  DISCOUNT_TYPE,
  type DiscountTypeValue,
  isDiscountType,
} from "@app/shared/config/invoice-status";

export interface DiscountInput {
  type: DiscountTypeValue;
  value: number;
}

interface LineItem {
  quantity: number;
  unitPrice: number;
}

interface TotalsResult {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
}

export function calculateTotals(
  items: LineItem[],
  discount?: DiscountInput | null,
  taxRate?: number
): TotalsResult {
  const subtotal = items.reduce((sum, item) => sum + Math.round(item.quantity * item.unitPrice), 0);

  let discountAmount = 0;

  if (discount && discount.value > 0) {
    if (discount.type === DISCOUNT_TYPE.PERCENTAGE) {
      discountAmount = Math.round((subtotal * discount.value) / 100);
    } else {
      discountAmount = discount.value;
    }
  }

  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const taxAmount = taxRate ? Math.round((afterDiscount * taxRate) / 100) : 0;
  const total = afterDiscount + taxAmount;

  return { subtotal, discountAmount, taxAmount, total };
}

export function buildDiscountInput(
  discountType: string | null | undefined,
  discountValue: number | null | undefined
): DiscountInput | null {
  if (!discountType || discountType === DISCOUNT_NONE || !discountValue || discountValue <= 0) {
    return null;
  }

  if (!isDiscountType(discountType)) {
    return null;
  }

  return { type: discountType, value: discountValue };
}
