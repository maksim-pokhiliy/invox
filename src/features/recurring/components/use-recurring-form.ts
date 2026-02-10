"use client";

import { useRouter } from "next/navigation";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@app/shared/ui/toast";
import { useCreateRecurring, useUpdateRecurring } from "@app/features/recurring";
import type { Client } from "@app/shared/schemas/api";
import { ApiError } from "@app/shared/api";
import { buildDiscountInput } from "@app/shared/lib/calculations";
import { useUnsavedChanges } from "@app/shared/hooks";
import { recurringFormSchema, type RecurringFormData } from "@app/shared/schemas";

interface UseRecurringFormOptions {
  mode?: "create" | "edit";
  recurringId?: string;
  initialData?: RecurringFormData;
  clients: Client[] | undefined;
  clientsLoading: boolean;
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
      description: item.description,
      quantity: item.quantity,
      unitPrice: Math.round(item.unitPrice * 100),
    })),
  };
}

function useRecurringSubmit(mode: "create" | "edit", recurringId?: string) {
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
      currency: "USD",
      discountType: "NONE",
      discountValue: 0,
      taxRate: 0,
      notes: "",
      dueDays: 30,
      autoSend: false,
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      items: [{ description: "", quantity: 1, unitPrice: 0 }],
    },
  });

  useUnsavedChanges(isDirty);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const currency = useWatch({ control, name: "currency" });
  const discountType = useWatch({ control, name: "discountType" });
  const items = useWatch({ control, name: "items" });

  const subtotal = items.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
    0
  );

  const duplicateItem = (index: number) => {
    const item = items[index];
    if (item) {
      append({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      });
    }
  };

  return {
    register,
    handleSubmit,
    control,
    errors,
    isDirty,
    fields,
    append,
    remove,
    duplicateItem,
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
