"use client";

import * as React from "react";

import { Alert, Box, Paper } from "@mui/material";

import type { InvoiceFormInput } from "@app/shared/schemas";
import type { Client } from "@app/shared/schemas/api";
import { type Cents, toDollars } from "@app/shared/types/money";
import { PageHeader } from "@app/shared/ui/page-header";

import { useInvoiceForm } from "../hooks/use-invoice-form";
import type {
  CreateClientMutation,
  InvoiceFormMode,
  InvoiceInitialData,
  TemplateData,
} from "../types";
import { InlineClientDialog } from "./inline-client-dialog";
import { InvoiceFormDetails } from "./invoice-form-details";
import { InvoiceFormDraftBanner } from "./invoice-form-draft-banner";
import { InvoiceFormLineItems } from "./invoice-form-line-items";
import { InvoiceFormTotals } from "./invoice-form-totals";

interface ImportRenderProps {
  addGroups: (groups: NonNullable<InvoiceFormInput["itemGroups"]>) => void;
  rateCents: Cents;
}

interface InvoiceFormProps {
  mode: InvoiceFormMode;
  invoiceId?: string;
  initialData?: InvoiceInitialData;
  templateId?: string;
  clients?: Client[];
  clientsLoading: boolean;
  template?: TemplateData;
  templateLoading: boolean;
  createClientMutation: CreateClientMutation;
  defaultRate?: Cents;
  defaultCurrency?: string;
  renderImport?: (props: ImportRenderProps) => React.ReactNode;
  renderServiceSelector?: (props: {
    onSelect: (item: {
      serviceId: string;
      title: string;
      description: string;
      quantity: number;
      unitPrice: number;
    }) => void;
    currency: string;
  }) => React.ReactNode;
}

export function InvoiceForm({
  mode,
  invoiceId,
  initialData,
  templateId,
  clients,
  clientsLoading,
  template,
  templateLoading,
  createClientMutation,
  defaultRate,
  defaultCurrency,
  renderImport,
  renderServiceSelector,
}: InvoiceFormProps) {
  const form = useInvoiceForm({
    mode,
    invoiceId,
    initialData,
    templateId,
    clients,
    clientsLoading,
    template,
    templateLoading,
    createClientMutation,
    defaultRate,
    defaultCurrency,
  });

  return (
    <>
      {mode === "create" && (
        <InvoiceFormDraftBanner
          isVisible={form.isDraftBannerVisible}
          lastSaved={form.lastSaved}
          isDirty={form.isDirty}
          onRestore={form.handleRestoreDraft}
          onDiscard={form.handleDiscardDraft}
        />
      )}

      <PageHeader
        title={mode === "create" ? "Create Invoice" : "Edit Invoice"}
        subtitle={
          mode === "create"
            ? "Fill in the details below to create a new invoice"
            : "Update the invoice details below"
        }
      />

      {form.error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {form.error}
        </Alert>
      )}

      <Paper sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3 }}>
        <Box component="form" onSubmit={form.handleSubmit(form.onSubmit)} noValidate>
          <InvoiceFormDetails
            register={form.register}
            control={form.control}
            errors={form.errors}
            clients={form.clients}
            clientsLoading={form.clientsLoading}
            onAddClient={() => form.setClientDialogOpen(true)}
          />

          <InvoiceFormLineItems
            fields={form.fields}
            sensors={form.sensors}
            handleDragEnd={form.handleDragEnd}
            register={form.register}
            control={form.control}
            errors={form.errors}
            currency={form.currency}
            onAppend={() =>
              form.append({
                title: "",
                description: "",
                quantity: 1,
                unitPrice: toDollars(form.resolvedRate),
              })
            }
            onRemove={form.remove}
            onDuplicate={form.duplicateItem}
            onMove={form.move}
            groupFields={form.groupFields}
            onRemoveGroup={form.removeGroup}
            onAddGroup={() => form.addGroup(toDollars(form.resolvedRate))}
            defaultUnitPrice={toDollars(form.resolvedRate)}
          />

          {renderServiceSelector?.({
            onSelect: form.appendFromService,
            currency: form.currency,
          })}

          {renderImport?.({
            addGroups: form.addImportedGroups,
            rateCents: form.resolvedRate,
          })}

          <InvoiceFormTotals
            subtotal={form.subtotal}
            currency={form.currency}
            isPending={form.isPending}
            mode={mode}
            invoiceId={invoiceId}
          />
        </Box>
      </Paper>

      <InlineClientDialog
        open={form.clientDialogOpen}
        onClose={() => form.setClientDialogOpen(false)}
        onSubmit={form.handleCreateClient}
        isPending={form.isCreatingClient}
        error={form.clientDialogError}
      />
    </>
  );
}
