"use client";

import * as React from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import type { FieldArrayWithId } from "react-hook-form";
import { useToast } from "@app/shared/ui/toast";
import { invoiceFormSchema, InvoiceFormInput, CreateClientInput } from "@app/shared/schemas";
import type { Client } from "@app/shared/schemas/api";
import { useUnsavedChanges } from "@app/shared/hooks";
import { INVOICE, TIME } from "@app/shared/config/config";
import { queryKeys } from "@app/shared/config/query";
import { ApiError } from "@app/shared/api";
import { useInvoiceDraft } from "./use-invoice-draft";
import { useInvoiceSubmit } from "./use-invoice-submit";

function useDragReorder(
  fields: FieldArrayWithId<InvoiceFormInput, "items">[],
  move: (from: number, to: number) => void
) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const oldIndex = fields.findIndex((f) => f.id === active.id);
        const newIndex = fields.findIndex((f) => f.id === over.id);
        move(oldIndex, newIndex);
      }
    },
    [fields, move]
  );

  return { sensors, handleDragEnd };
}

function getDefaultDueDate(): string {
  return new Date(Date.now() + INVOICE.DEFAULT_DUE_DAYS * TIME.DAY).toISOString().split("T")[0];
}

function getTemplateDueDate(dueDays: number): string {
  return new Date(Date.now() + dueDays * TIME.DAY).toISOString().split("T")[0];
}

interface TemplateData {
  name: string;
  currency: string;
  dueDays: number;
  notes: string | null;
  items: { description: string; quantity: number; unitPrice: number }[];
}

interface CreateClientMutation {
  mutate: (
    data: CreateClientInput,
    options: {
      onSuccess: () => void;
      onError: (err: Error) => void;
    }
  ) => void;
  isPending: boolean;
}

function useInitialRate(
  mode: "create" | "edit",
  hasInitialData: boolean,
  hasTemplate: boolean,
  resolvedRate: number,
  items: InvoiceFormInput["items"],
  setValue: (name: `items.${number}.unitPrice`, value: number) => void
) {
  const applied = React.useRef(false);

  React.useEffect(() => {
    if (
      mode !== "create" ||
      hasInitialData ||
      hasTemplate ||
      applied.current ||
      resolvedRate <= 0
    ) {
      return;
    }
    const rateInDollars = resolvedRate / 100;
    items.forEach((item, index) => {
      if (item.unitPrice === 0) {
        setValue(`items.${index}.unitPrice`, rateInDollars);
      }
    });
    applied.current = true;
  }, [mode, hasInitialData, hasTemplate, resolvedRate, items, setValue]);
}

function useTemplateApplication(
  mode: "create" | "edit",
  template: TemplateData | undefined,
  templateLoading: boolean,
  reset: (values: InvoiceFormInput) => void
) {
  const toast = useToast();
  const [templateApplied, setTemplateApplied] = React.useState(false);

  React.useEffect(() => {
    if (mode === "create" && template && !templateApplied && !templateLoading) {
      reset({
        clientId: "",
        currency: template.currency,
        dueDate: getTemplateDueDate(template.dueDays),
        items: template.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice / 100,
        })),
        notes: template.notes || "",
      });
      setTemplateApplied(true);
      toast.success(`Template "${template.name}" applied`);
    }
  }, [mode, template, templateApplied, templateLoading, reset, toast]);
}

function useClientDialog(createClientMutation: CreateClientMutation) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSuccess = React.useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.clients });
    setOpen(false);
    setError(null);
    toast.success("Client added successfully!");
  }, [queryClient, toast]);

  const handleCreate = React.useCallback(
    (data: CreateClientInput) => {
      setError(null);
      createClientMutation.mutate(data, {
        onSuccess: () => handleSuccess(),
        onError: (err) => {
          setError(err instanceof ApiError ? err.message : "Failed to create client");
        },
      });
    },
    [createClientMutation, handleSuccess]
  );

  return {
    open,
    setOpen,
    error,
    handleCreate,
    isPending: createClientMutation.isPending,
  };
}

interface UseInvoiceFormOptions {
  mode: "create" | "edit";
  invoiceId?: string;
  initialData?: {
    clientId: string;
    currency: string;
    dueDate: string;
    items: { description: string; quantity: number; unitPrice: number }[];
    notes: string;
  };
  templateId?: string;
  clients?: Client[];
  clientsLoading: boolean;
  template?: TemplateData;
  templateLoading: boolean;
  createClientMutation: CreateClientMutation;
  defaultRate?: number;
}

export function useInvoiceForm({
  mode,
  invoiceId,
  initialData,
  clients,
  clientsLoading,
  template,
  templateLoading,
  createClientMutation,
  defaultRate = 0,
}: UseInvoiceFormOptions) {
  const clientDialog = useClientDialog(createClientMutation);
  const [defaultDueDate] = React.useState(getDefaultDueDate);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<InvoiceFormInput>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: initialData || {
      clientId: "",
      currency: "USD",
      dueDate: defaultDueDate,
      items: [{ description: "", quantity: 1, unitPrice: 0 }],
      notes: "",
    },
  });

  const { fields, append, remove, move } = useFieldArray({ control, name: "items" });
  const { sensors, handleDragEnd } = useDragReorder(fields, move);

  useUnsavedChanges(isDirty);

  const formValues = useWatch({ control }) as InvoiceFormInput;
  const draft = useInvoiceDraft({ mode, formValues, isDirty, reset });
  const { error, isPending, onSubmit } = useInvoiceSubmit({
    mode,
    invoiceId,
    onDraftClear: draft.clearDraft,
  });

  useTemplateApplication(mode, template, templateLoading, reset);

  const items = useWatch({ control, name: "items" });
  const currency = useWatch({ control, name: "currency" });

  const subtotal = items.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
    0
  );

  const clientId = useWatch({ control, name: "clientId" });
  const selectedClient = clients?.find((c) => c.id === clientId);
  const resolvedRate = selectedClient?.defaultRate ?? defaultRate;

  useInitialRate(mode, !!initialData, !!template, resolvedRate, items, setValue);

  const duplicateItem = React.useCallback(
    (index: number) => {
      const item = items[index];
      if (item) {
        append({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        });
      }
    },
    [items, append]
  );

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
    error,
    clientDialogOpen: clientDialog.open,
    setClientDialogOpen: clientDialog.setOpen,
    showDraftBanner: draft.showDraftBanner,
    isPending,
    subtotal,
    currency,
    isDirty,
    lastSaved: draft.lastSaved,
    onSubmit,
    handleRestoreDraft: draft.handleRestoreDraft,
    handleDiscardDraft: draft.handleDiscardDraft,
    handleCreateClient: clientDialog.handleCreate,
    isCreatingClient: clientDialog.isPending,
    clientDialogError: clientDialog.error,
    clients,
    clientsLoading,
    resolvedRate,
    duplicateItem,
  };
}
