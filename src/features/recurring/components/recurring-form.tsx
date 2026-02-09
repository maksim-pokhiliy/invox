"use client";

import { useCallback } from "react";
import { Box } from "@mui/material";
import { PageHeader } from "@app/shared/ui/page-header";
import { Spinner } from "@app/shared/ui/loading";
import { FormActions } from "@app/shared/ui/form-actions";
import type { Client } from "@app/shared/schemas/api";
import { useRecurringForm } from "./use-recurring-form";
import { RecurringFormSchedule } from "./recurring-form-schedule";
import { RecurringFormItems } from "./recurring-form-items";
import { RecurringFormDiscounts } from "./recurring-form-discounts";

interface RecurringFormProps {
  clients: Client[] | undefined;
  clientsLoading: boolean;
}

export function RecurringForm({ clients, clientsLoading }: RecurringFormProps) {
  const {
    register,
    handleSubmit,
    control,
    errors,
    fields,
    append,
    remove,
    currency,
    discountType,
    subtotal,
    isPending,
    onSubmit,
    router,
  } = useRecurringForm({ clients, clientsLoading });

  const handleAppend = useCallback(
    () => append({ description: "", quantity: 1, unitPrice: 0 }),
    [append]
  );

  if (clientsLoading) {
    return <Spinner />;
  }

  return (
    <>
      <PageHeader title="New Recurring Invoice" subtitle="Set up automatic invoice generation" />

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
        />

        <RecurringFormDiscounts
          register={register}
          discountType={discountType}
          currency={currency}
        />

        <FormActions
          onCancel={() => router.back()}
          submitLabel="Create Schedule"
          loading={isPending}
        />
      </Box>
    </>
  );
}
