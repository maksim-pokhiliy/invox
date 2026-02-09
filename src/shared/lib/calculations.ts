export interface DiscountInput {
  type: "PERCENTAGE" | "FIXED";
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
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  let discountAmount = 0;
  if (discount && discount.value > 0) {
    if (discount.type === "PERCENTAGE") {
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
  if (!discountType || discountType === "NONE" || !discountValue || discountValue <= 0) {
    return null;
  }
  return { type: discountType as DiscountInput["type"], value: discountValue };
}
