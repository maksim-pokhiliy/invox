"use client";

import * as React from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { useUnsavedChanges } from "@app/shared/hooks";
import { InvoiceFormInput, invoiceFormSchema } from "@app/shared/schemas";
import type { Client } from "@app/shared/schemas/api";

import { computeSubtotal, getDefaultDueDate, getFormDefaults } from "../lib/invoice-calculations";
import type {
  CreateClientMutation,
  InvoiceFormMode,
  InvoiceInitialData,
  TemplateData,
} from "../types";
import { useClientDialog } from "./use-client-dialog";
import { useDragReorder } from "./use-drag-reorder";
import { useInitialRate } from "./use-initial-rate";
import { useInvoiceDraft } from "./use-invoice-draft";
import { useInvoiceSubmit } from "./use-invoice-submit";
import { useItemActions } from "./use-item-actions";
import { useTemplateApplication } from "./use-template-application";

interface UseInvoiceFormOptions {
  mode: InvoiceFormMode;
  invoiceId?: string;
  initialData?: InvoiceInitialData;
  templateId?: string;
  clients?: Client[];
  clientsLoading: boolean;
  template?: TemplateData;
  templateLoading: boolean;
  createClientMutation: CreateClientMutation;
  defaultRate?: number;
  defaultCurrency?: string;
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
  defaultCurrency,
}: UseInvoiceFormOptions) {
  const clientDialog = useClientDialog(createClientMutation);
  const [defaultDueDate] = React.useState(getDefaultDueDate);

  const form = useForm<InvoiceFormInput>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: initialData
      ? { ...initialData, itemGroups: initialData.itemGroups ?? [] }
      : getFormDefaults(defaultDueDate, defaultCurrency),
  });

  const { register, handleSubmit, control, reset, setValue } = form;
  const { errors, isDirty } = form.formState;

  const { fields, append, remove, move } = useFieldArray({ control, name: "items" });
  const { sensors, handleDragEnd } = useDragReorder(fields, move);

  const groupArray = useFieldArray({ control, name: "itemGroups" });

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
  const clientId = useWatch({ control, name: "clientId" });
  const watchedGroups = useWatch({ control, name: "itemGroups" }) ?? [];
  const subtotal = computeSubtotal(items, watchedGroups);
  const selectedClient = clients?.find((c) => c.id === clientId);
  const resolvedRate = selectedClient?.defaultRate ?? defaultRate;

  useInitialRate(mode, !!initialData, !!template, resolvedRate, items, setValue);

  const { duplicateItem, addImportedGroups, addGroup } = useItemActions(
    items,
    append,
    remove,
    groupArray
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
    groupFields: groupArray.fields,
    removeGroup: groupArray.remove,
    moveGroup: groupArray.move,
    addImportedGroups,
    addGroup,
  };
}
