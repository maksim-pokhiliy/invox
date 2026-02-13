"use client";

import { useCallback } from "react";

import SaveIcon from "@mui/icons-material/Save";
import { Box, Button, Stack } from "@mui/material";

import type { FormMode } from "@app/shared/config/config";
import type { TemplateFormData } from "@app/shared/schemas";
import { LoadingButton } from "@app/shared/ui/loading-button";
import { PageHeader } from "@app/shared/ui/page-header";

import { useTemplateForm } from "../hooks/use-template-form";
import { TemplateFormDetails } from "./template-form-details";
import { TemplateFormItems } from "./template-form-items";

interface TemplateFormProps {
  mode?: FormMode;
  templateId?: string;
  initialData?: TemplateFormData;
  defaultCurrency?: string;
}

export function TemplateForm({
  mode = "create",
  templateId,
  initialData,
  defaultCurrency,
}: TemplateFormProps) {
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
    currency,
    discountType,
    duplicateItem,
    groupFields,
    removeGroup,
    addGroup,
    isPending,
    isEdit,
    onSubmit,
    router,
  } = useTemplateForm({ mode, templateId, initialData, defaultCurrency });

  const handleAppend = useCallback(
    () => append({ title: "", description: "", quantity: 1, unitPrice: 0 }),
    [append]
  );

  return (
    <>
      <PageHeader
        title={isEdit ? "Edit Template" : "Create Template"}
        subtitle={
          isEdit ? "Update your invoice template" : "Create a reusable template for common invoices"
        }
      />

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <TemplateFormDetails
          register={register}
          errors={errors}
          currency={currency}
          discountType={discountType}
        />

        <TemplateFormItems
          fields={fields}
          sensors={sensors}
          handleDragEnd={handleDragEnd}
          register={register}
          control={control}
          errors={errors}
          currency={currency}
          onAppend={handleAppend}
          onRemove={remove}
          onDuplicate={duplicateItem}
          groupFields={groupFields}
          onRemoveGroup={removeGroup}
          onAddGroup={addGroup}
        />

        <Stack direction="row" spacing={2} sx={{ justifyContent: "flex-end" }}>
          <Button variant="outlined" onClick={() => router.push("/app/templates")}>
            Cancel
          </Button>
          <LoadingButton
            type="submit"
            variant="contained"
            startIcon={<SaveIcon />}
            loading={isPending}
          >
            {isEdit ? "Save Changes" : "Create Template"}
          </LoadingButton>
        </Stack>
      </Box>
    </>
  );
}
