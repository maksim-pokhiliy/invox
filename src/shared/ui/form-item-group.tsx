"use client";

import type { Control, FieldValues, UseFormRegister } from "react-hook-form";
import { useFieldArray } from "react-hook-form";

import { Stack } from "@mui/material";

import { SORT_ORDER } from "@app/shared/config/config";

import { LineItemGroup } from "./line-item-group";
import { LineItemRow } from "./line-item-row";

interface FormItemGroupProps<T extends FieldValues> {
  groupIndex: number;
  control: Control<T>;
  register: UseFormRegister<T>;
  currency: string;
  onRemoveGroup: () => void;
  canDeleteGroup: boolean;
  defaultUnitPrice?: number;
}

export function FormItemGroup<T extends FieldValues>({
  groupIndex,
  control,
  register,
  currency,
  onRemoveGroup,
  canDeleteGroup,
  defaultUnitPrice = 0,
}: FormItemGroupProps<T>) {
  const fieldArrayControl = control as unknown as Control<FieldValues>;
  const reg = register as unknown as UseFormRegister<FieldValues>;

  const { fields, remove, append } = useFieldArray({
    control: fieldArrayControl,
    name: `itemGroups.${groupIndex}.items`,
  });

  return (
    <LineItemGroup
      groupTitleField={reg(`itemGroups.${groupIndex}.title`)}
      itemCount={fields.length}
      onRemoveGroup={onRemoveGroup}
      canDeleteGroup={canDeleteGroup}
      onAddItem={() =>
        append({
          title: "",
          description: "",
          quantity: 1,
          unitPrice: defaultUnitPrice,
          sortOrder: fields.length * SORT_ORDER.GAP,
        })
      }
    >
      {fields.map((field, itemIndex) => (
        <Stack key={field.id} sx={{ px: 2, py: 1, borderTop: 1, borderColor: "divider" }}>
          <LineItemRow
            titleField={reg(`itemGroups.${groupIndex}.items.${itemIndex}.title`)}
            descriptionField={reg(`itemGroups.${groupIndex}.items.${itemIndex}.description`)}
            quantityField={reg(`itemGroups.${groupIndex}.items.${itemIndex}.quantity`, {
              valueAsNumber: true,
            })}
            unitPriceField={reg(`itemGroups.${groupIndex}.items.${itemIndex}.unitPrice`, {
              valueAsNumber: true,
            })}
            currency={currency}
            onRemove={() => remove(itemIndex)}
            canRemove={fields.length > 1}
          />
        </Stack>
      ))}
    </LineItemGroup>
  );
}
