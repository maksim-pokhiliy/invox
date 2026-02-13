"use client";

import * as React from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";

import { ApiError } from "@app/shared/api";
import { BRANDING, type FormMode, SORT_ORDER } from "@app/shared/config/config";
import { useUnsavedChanges } from "@app/shared/hooks";
import { useDragReorder } from "@app/shared/hooks/use-drag-reorder";
import { useToast } from "@app/shared/hooks/use-toast";
import { buildDiscountInput } from "@app/shared/lib/calculations";
import { type RecurringFormData, recurringFormSchema } from "@app/shared/schemas";
import type { Client } from "@app/shared/schemas/api";

import { useCreateRecurring, useUpdateRecurring } from ".";

interface UseRecurringFormOptions {
  mode?: FormMode;
  recurringId?: string;
  initialData?: RecurringFormData;
  clients: Client[] | undefined;
  clientsLoading: boolean;
  defaultCurrency?: string;
}

function buildSubmitData(data: RecurringFormData) {
  return {
    clientId: data.clientId,
    name: data.name,
    frequency: data.frequency,
    currency: data.currency,
    discount: buildDiscountInput(data.discountType, data.discountValue) ?? undefined,
    taxRate: data.taxRate,
    notes: data.notes || undefined,
    dueDays: data.dueDays,
    autoSend: data.autoSend,
    startDate: data.startDate,
    endDate: data.endDate || undefined,
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

function useRecurringSubmit(mode: FormMode, recurringId?: string) {
  const router = useRouter();
  const toast = useToast();
  const createMutation = useCreateRecurring();
  const updateMutation = useUpdateRecurring();
  const isEdit = mode === "edit";

  const onSubmit = (data: RecurringFormData) => {
    const submitData = buildSubmitData(data);

    if (isEdit && recurringId) {
      updateMutation.mutate(
        { id: recurringId, data: submitData },
        {
          onSuccess: () => {
            toast.success("Recurring invoice updated");
            router.push("/app/recurring");
          },
          onError: (err) => {
            toast.error(
              err instanceof ApiError ? err.message : "Failed to update recurring invoice"
            );
          },
        }
      );
    } else {
      createMutation.mutate(submitData, {
        onSuccess: () => {
          toast.success("Recurring invoice created");
          router.push("/app/recurring");
        },
        onError: (err) => {
          toast.error(err instanceof ApiError ? err.message : "Failed to create recurring invoice");
        },
      });
    }
  };

  return {
    onSubmit,
    isPending: isEdit ? updateMutation.isPending : createMutation.isPending,
    isEdit,
    router,
  };
}

export function useRecurringForm({
  mode = "create",
  recurringId,
  initialData,
  clients,
  clientsLoading,
  defaultCurrency,
}: UseRecurringFormOptions) {
  const { onSubmit, isPending, isEdit, router } = useRecurringSubmit(mode, recurringId);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<RecurringFormData>({
    resolver: zodResolver(recurringFormSchema),
    defaultValues: initialData ?? {
      clientId: "",
      name: "",
      frequency: "MONTHLY",
      currency: defaultCurrency ?? BRANDING.DEFAULT_CURRENCY,
      discountType: "NONE",
      discountValue: 0,
      taxRate: 0,
      notes: "",
      dueDays: 30,
      autoSend: false,
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      items: [{ title: "", description: "", quantity: 1, unitPrice: 0 }],
      itemGroups: [],
    },
  });

  useUnsavedChanges(isDirty);

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "items",
  });

  const groupArray = useFieldArray({ control, name: "itemGroups" });
  const { sensors, handleDragEnd } = useDragReorder(fields, move);

  const currency = useWatch({ control, name: "currency" });
  const discountType = useWatch({ control, name: "discountType" });
  const items = useWatch({ control, name: "items" });

  const subtotal = items.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
    0
  );

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

  const addGroup = React.useCallback(() => {
    groupArray.append({
      title: "",
      sortOrder: groupArray.fields.length * SORT_ORDER.GAP,
      items: [{ title: "", description: "", quantity: 1, unitPrice: 0, sortOrder: 0 }],
    });
  }, [groupArray]);

  return {
    register,
    handleSubmit,
    control,
    errors,
    isDirty,
    fields,
    append,
    remove,
    sensors,
    handleDragEnd,
    duplicateItem,
    groupFields: groupArray.fields,
    removeGroup: groupArray.remove,
    addGroup,
    currency,
    discountType,
    items,
    subtotal,
    isPending,
    isEdit,
    clients,
    clientsLoading,
    onSubmit,
    router,
  };
}
