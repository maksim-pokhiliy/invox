"use client";

import { useCallback } from "react";
import { Box } from "@mui/material";
import { PageHeader } from "@app/shared/ui/page-header";
import { Spinner } from "@app/shared/ui/loading";
import { FormActions } from "@app/shared/ui/form-actions";
import type { Client } from "@app/shared/schemas/api";
import type { RecurringFormData } from "@app/shared/schemas";
import { useRecurringForm } from "./use-recurring-form";
import { RecurringFormSchedule } from "./recurring-form-schedule";
import { RecurringFormItems } from "./recurring-form-items";
import { RecurringFormDiscounts } from "./recurring-form-discounts";

interface RecurringFormProps {
  mode?: "create" | "edit";
  recurringId?: string;
  initialData?: RecurringFormData;
  clients: Client[] | undefined;
  clientsLoading: boolean;
}

export function RecurringForm({
  mode = "create",
  recurringId,
  initialData,
  clients,
  clientsLoading,
}: RecurringFormProps) {
  const {
    register,
    handleSubmit,
    control,
    errors,
    fields,
    append,
    remove,
    duplicateItem,
    currency,
    discountType,
    subtotal,
    isPending,
    isEdit,
    onSubmit,
    router,
  } = useRecurringForm({ mode, recurringId, initialData, clients, clientsLoading });

  const handleAppend = useCallback(
    () => append({ description: "", quantity: 1, unitPrice: 0 }),
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
          register={register}
          errors={errors}
          currency={currency}
          subtotal={subtotal}
          onAppend={handleAppend}
          onRemove={remove}
          onDuplicate={duplicateItem}
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
