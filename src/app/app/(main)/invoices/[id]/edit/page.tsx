"use client";

import { useParams, useRouter } from "next/navigation";

import { Alert, Box, Button } from "@mui/material";

import { INVOICE_STATUS } from "@app/shared/config/invoice-status";
import { AppLayout } from "@app/shared/layout/app-layout";
import { Breadcrumbs } from "@app/shared/ui/breadcrumbs";
import { CardSkeleton } from "@app/shared/ui/skeletons";

import { useClients, useCreateClient } from "@app/features/clients";
import { mapInvoiceToFormData, useInvoice } from "@app/features/invoices";
import { InvoiceForm } from "@app/features/invoices/components";
import { ServiceSelector } from "@app/features/services/components";
import { useSenderProfile } from "@app/features/settings";
import { TimeTrackingImportSection } from "@app/features/time-tracking/components";

export default function EditInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = String(params.id);
  const { data: invoice, isLoading, error } = useInvoice(invoiceId);
  const { data: clients, isLoading: clientsLoading } = useClients();
  const createClientMutation = useCreateClient();
  const { data: senderProfile } = useSenderProfile();

  if (isLoading) {
    return (
      <AppLayout>
        <CardSkeleton />
      </AppLayout>
    );
  }

  if (error || !invoice) {
    return (
      <AppLayout>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          Failed to load invoice. Please try again.
        </Alert>
      </AppLayout>
    );
  }

  if (invoice.status !== INVOICE_STATUS.DRAFT) {
    return (
      <AppLayout>
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          Only draft invoices can be edited.
        </Alert>

        <Box sx={{ mt: 2 }}>
          <Button variant="outlined" onClick={() => router.push(`/app/invoices/${invoiceId}`)}>
            Back to Invoice
          </Button>
        </Box>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Breadcrumbs
        items={[
          { label: "Invoices", href: "/app/invoices" },
          { label: `#${invoice.publicId}`, href: `/app/invoices/${invoiceId}` },
          { label: "Edit" },
        ]}
      />
      <InvoiceForm
        mode="edit"
        invoiceId={invoiceId}
        initialData={mapInvoiceToFormData(invoice)}
        clients={clients}
        clientsLoading={clientsLoading}
        template={undefined}
        templateLoading={false}
        createClientMutation={createClientMutation}
        defaultRate={senderProfile?.defaultRate ?? undefined}
        defaultCurrency={senderProfile?.defaultCurrency}
        renderImport={({ addGroups, rateCents }) => (
          <TimeTrackingImportSection onImport={addGroups} getpaidRateCents={rateCents} />
        )}
        renderServiceSelector={({ onSelect, currency }) => (
          <ServiceSelector onSelect={onSelect} currency={currency} />
        )}
      />
    </AppLayout>
  );
}
