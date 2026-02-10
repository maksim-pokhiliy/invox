"use client";

import { Box, Paper, Alert } from "@mui/material";
import { PageHeader } from "@app/shared/ui/page-header";
import { InlineClientDialog } from "./inline-client-dialog";
import { InvoiceFormDraftBanner } from "./invoice-form-draft-banner";
import { InvoiceFormDetails } from "./invoice-form-details";
import { InvoiceFormLineItems } from "./invoice-form-line-items";
import { InvoiceFormTotals } from "./invoice-form-totals";
import { useInvoiceForm } from "./use-invoice-form";
import type { Client } from "@app/shared/schemas/api";
import type { CreateClientInput } from "@app/shared/schemas";

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

interface TemplateData {
  name: string;
  currency: string;
  dueDays: number;
  notes: string | null;
  items: { description: string; quantity: number; unitPrice: number }[];
}

interface InvoiceFormProps {
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
  });

  return (
    <>
      {mode === "create" && (
        <InvoiceFormDraftBanner
          showBanner={form.showDraftBanner}
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
            errors={form.errors}
            currency={form.currency}
            onAppend={() =>
              form.append({ description: "", quantity: 1, unitPrice: form.resolvedRate / 100 })
            }
            onRemove={form.remove}
            onDuplicate={form.duplicateItem}
          />
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
