"use client";

import * as React from "react";
import type { UseFieldArrayReturn } from "react-hook-form";

import { INVOICE, SORT_ORDER, TIME } from "@app/shared/config/config";
import type {
  CreateClientInput,
  InvoiceFormInput,
  InvoiceItemGroupInput,
} from "@app/shared/schemas";

export interface TemplateData {
  name: string;
  currency: string;
  dueDays: number;
  notes: string | null;
  items: { description: string; quantity: number; unitPrice: number }[];
}

export interface CreateClientMutation {
  mutate: (
    data: CreateClientInput,
    options: {
      onSuccess: () => void;
      onError: (err: Error) => void;
    }
  ) => void;
  isPending: boolean;
}

export function getDefaultDueDate(): string {
  return new Date(Date.now() + INVOICE.DEFAULT_DUE_DAYS * TIME.DAY).toISOString().split("T")[0];
}

export function getTemplateDueDate(dueDays: number): string {
  return new Date(Date.now() + dueDays * TIME.DAY).toISOString().split("T")[0];
}

export function getFormDefaults(dueDate: string): InvoiceFormInput {
  return {
    clientId: "",
    currency: "USD",
    dueDate,
    items: [{ title: "", description: "", quantity: 1, unitPrice: 0 }],
    itemGroups: [],
    notes: "",
  };
}

export function computeSubtotal(items: InvoiceFormInput["items"], groups: InvoiceItemGroupInput[]) {
  const itemsTotal = items.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
    0
  );
  const groupsTotal = groups.reduce(
    (sum, group) =>
      sum + group.items.reduce((gs, item) => gs + (item.quantity || 0) * (item.unitPrice || 0), 0),
    0
  );

  return itemsTotal + groupsTotal;
}

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
