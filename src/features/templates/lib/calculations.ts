import { DISCOUNT_TYPE, isDiscountType } from "@app/shared/config/invoice-status";
import { buildDiscountInput, calculateTotals } from "@app/shared/lib/calculations";
import type { Template, TemplateFormData } from "@app/shared/schemas";

export function calculateEstimatedTotal(template: Template) {
  const allItems = [...template.items, ...template.itemGroups.flatMap((g) => g.items)];

  const { total } = calculateTotals(
    allItems,
    buildDiscountInput(template.discountType, template.discountValue),
    template.taxRate
  );

  return total;
}

function buildDiscount(discountType: string | undefined, discountValue: number | undefined) {
  if (!isDiscountType(discountType) || !discountValue) {
    return undefined;
  }

  const value =
    discountType === DISCOUNT_TYPE.FIXED ? Math.round(discountValue * 100) : discountValue;

  return { type: discountType, value };
}

export function buildSubmitData(data: TemplateFormData) {
  return {
    name: data.name,
    description: data.description || undefined,
    currency: data.currency,
    discount: buildDiscount(data.discountType, data.discountValue),
    taxRate: data.taxRate || undefined,
    notes: data.notes || undefined,
    dueDays: data.dueDays,
    items: data.items.map((item) => ({
      title: item.title,
      description: item.description || undefined,
      quantity: item.quantity,
      unitPrice: Math.round(item.unitPrice * 100),
    })),
    itemGroups: data.itemGroups?.map((group) => ({
      title: group.title,
      items: group.items.map((item) => ({
        title: item.title,
        description: item.description || undefined,
        quantity: item.quantity,
        unitPrice: Math.round(item.unitPrice * 100),
      })),
    })),
  };
}
