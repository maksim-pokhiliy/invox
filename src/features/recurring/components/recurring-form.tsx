"use client";

import { useCallback } from "react";

import { Box } from "@mui/material";

import type { FormMode } from "@app/shared/config/config";
import type { RecurringFormData } from "@app/shared/schemas";
import type { Client } from "@app/shared/schemas/api";
import { FormActions } from "@app/shared/ui/form-actions";
import { Spinner } from "@app/shared/ui/loading";
import { PageHeader } from "@app/shared/ui/page-header";

import { useRecurringForm } from "../hooks/use-recurring-form";
import { RecurringFormDiscounts } from "./recurring-form-discounts";
import { RecurringFormItems } from "./recurring-form-items";
import { RecurringFormSchedule } from "./recurring-form-schedule";

interface RecurringFormProps {
  mode?: FormMode;
  recurringId?: string;
  initialData?: RecurringFormData;
  clients: Client[] | undefined;
  clientsLoading: boolean;
  defaultCurrency?: string;
}

export function RecurringForm({
  mode = "create",
  recurringId,
  initialData,
  clients,
  clientsLoading,
  defaultCurrency,
}: RecurringFormProps) {
  const {
    register,
    handleSubmit,
    control,
    errors,
    fields,
    append,
    remove,
    sensors,
    handleDragEnd,
    duplicateItem,
    groupFields,
    removeGroup,
    addGroup,
    currency,
    discountType,
    subtotal,
    isPending,
    isEdit,
    onSubmit,
    router,
  } = useRecurringForm({
    mode,
    recurringId,
    initialData,
    clients,
    clientsLoading,
    defaultCurrency,
  });

  const handleAppend = useCallback(
    () => append({ title: "", description: "", quantity: 1, unitPrice: 0 }),
    [append]
  );

  if (clientsLoading) {
    return <Spinner />;
  }

  return (
    <>
      <PageHeader
        title={isEdit ? "Edit Recurring Invoice" : "New Recurring Invoice"}
        subtitle={isEdit ? "Update your recurring schedule" : "Set up automatic invoice generation"}
      />

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <RecurringFormSchedule
          register={register}
          errors={errors}
          clients={clients}
          control={control}
        />

        <RecurringFormItems
          fields={fields}
          sensors={sensors}
          handleDragEnd={handleDragEnd}
          register={register}
          control={control}
          errors={errors}
          currency={currency}
          subtotal={subtotal}
          onAppend={handleAppend}
          onRemove={remove}
          onDuplicate={duplicateItem}
          groupFields={groupFields}
          onRemoveGroup={removeGroup}
          onAddGroup={addGroup}
        />

        <RecurringFormDiscounts
          register={register}
          discountType={discountType}
          currency={currency}
        />

        <FormActions
          onCancel={() => router.back()}
          submitLabel={isEdit ? "Save Changes" : "Create Schedule"}
          loading={isPending}
        />
      </Box>
    </>
  );
}
