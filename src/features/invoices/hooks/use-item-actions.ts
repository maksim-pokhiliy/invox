"use client";

import * as React from "react";
import type { UseFieldArrayReturn } from "react-hook-form";

import { SORT_ORDER } from "@app/shared/config/config";
import type { InvoiceFormInput, InvoiceItemGroupInput } from "@app/shared/schemas";

export function useItemActions(
  items: InvoiceFormInput["items"],
  append: (value: InvoiceFormInput["items"][number]) => void,
  remove: (index: number | number[]) => void,
  groupArray: UseFieldArrayReturn<InvoiceFormInput, "itemGroups", "id">
) {
  const duplicateItem = React.useCallback(
    (index: number) => {
      const item = items[index];

      if (item) {
        append({
          title: item.title,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        });
      }
    },
    [items, append]
  );

  const addImportedGroups = React.useCallback(
    (groups: InvoiceItemGroupInput[]) => {
      const emptyIndexes: number[] = [];

      items.forEach((item, index) => {
        if (!item.title) {
          emptyIndexes.push(index);
        }
      });

      if (emptyIndexes.length > 0) {
        remove(emptyIndexes);
      }

      groups.forEach((group, gi) =>
        groupArray.append({
          ...group,
          sortOrder: (groupArray.fields.length + gi) * SORT_ORDER.GAP,
          items: group.items.map((item, ii) => ({ ...item, sortOrder: ii * SORT_ORDER.GAP })),
        })
      );
    },
    [items, remove, groupArray]
  );

  const addGroup = React.useCallback(
    (defaultUnitPrice: number) => {
      groupArray.append({
        title: "",
        sortOrder: groupArray.fields.length * SORT_ORDER.GAP,
        items: [
          { title: "", description: "", quantity: 1, unitPrice: defaultUnitPrice, sortOrder: 0 },
        ],
      });
    },
    [groupArray]
  );

  return { duplicateItem, addImportedGroups, addGroup };
}
