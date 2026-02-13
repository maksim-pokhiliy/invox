"use client";

import * as React from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";

import { ApiError } from "@app/shared/api";
import { BRANDING, type FormMode, SORT_ORDER } from "@app/shared/config/config";
import { useDragReorder } from "@app/shared/hooks/use-drag-reorder";
import { useToast } from "@app/shared/hooks/use-toast";
import { type TemplateFormData, templateFormSchema } from "@app/shared/schemas";

import { useCreateTemplate, useUpdateTemplate } from "@app/features/templates";

import { buildSubmitData } from "../lib/calculations";

interface UseTemplateFormOptions {
  mode?: FormMode;
  templateId?: string;
  initialData?: TemplateFormData;
  defaultCurrency?: string;
}

function useTemplateSubmit(mode: FormMode, templateId?: string) {
  const router = useRouter();
  const toast = useToast();
  const createMutation = useCreateTemplate();
  const updateMutation = useUpdateTemplate();
  const isEdit = mode === "edit";

  const onSubmit = (data: TemplateFormData) => {
    const submitData = buildSubmitData(data);

    if (isEdit && templateId) {
      updateMutation.mutate(
        { id: templateId, data: submitData },
        {
          onSuccess: () => {
            toast.success("Template updated successfully!");
            router.push("/app/templates");
          },
          onError: (err) => {
            toast.error(err instanceof ApiError ? err.message : "Failed to update template");
          },
        }
      );
    } else {
      createMutation.mutate(submitData, {
        onSuccess: () => {
          toast.success("Template created successfully!");
          router.push("/app/templates");
        },
        onError: (err) => {
          toast.error(err instanceof ApiError ? err.message : "Failed to create template");
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

export function useTemplateForm({
  mode = "create",
  templateId,
  initialData,
  defaultCurrency,
}: UseTemplateFormOptions = {}) {
  const { onSubmit, isPending, isEdit, router } = useTemplateSubmit(mode, templateId);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: initialData ?? {
      name: "",
      description: "",
      currency: defaultCurrency ?? BRANDING.DEFAULT_CURRENCY,
      discountType: "",
      discountValue: 0,
      taxRate: 0,
      notes: "",
      dueDays: 30,
      items: [{ title: "", description: "", quantity: 1, unitPrice: 0 }],
      itemGroups: [],
    },
  });

  const { fields, append, remove, move } = useFieldArray({ control, name: "items" });
  const groupArray = useFieldArray({ control, name: "itemGroups" });
  const { sensors, handleDragEnd } = useDragReorder(fields, move);

  const currency = useWatch({ control, name: "currency" });
  const discountType = useWatch({ control, name: "discountType" });
  const items = useWatch({ control, name: "items" });

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
    fields,
    append,
    remove,
    sensors,
    handleDragEnd,
    currency,
    discountType,
    duplicateItem,
    groupFields: groupArray.fields,
    removeGroup: groupArray.remove,
    addGroup,
    isPending,
    isEdit,
    onSubmit,
    router,
  };
}
