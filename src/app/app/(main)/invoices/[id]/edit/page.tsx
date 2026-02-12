"use client";

import { useParams, useRouter } from "next/navigation";

import { Alert, Box, Button } from "@mui/material";

import { AppLayout } from "@app/shared/layout/app-layout";
import { Breadcrumbs } from "@app/shared/ui/breadcrumbs";
import { CardSkeleton } from "@app/shared/ui/loading";

import { useClients, useCreateClient } from "@app/features/clients";
import { useInvoice } from "@app/features/invoices";
import { InvoiceForm } from "@app/features/invoices/components";
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

  if (invoice.status !== "DRAFT") {
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
        initialData={{
          clientId: invoice.client.id,
          currency: invoice.currency,
          dueDate: new Date(invoice.dueDate).toISOString().split("T")[0],
          items: invoice.items.map((item) => ({
            title: item.title,
            description: item.description ?? "",
            quantity: item.quantity,
            unitPrice: item.unitPrice / 100,
          })),
          itemGroups: invoice.itemGroups?.map((group) => ({
            title: group.title,
            sortOrder: group.sortOrder,
            items: group.items.map((item) => ({
              title: item.title,
              description: item.description ?? "",
              quantity: item.quantity,
              unitPrice: item.unitPrice / 100,
              sortOrder: item.sortOrder,
            })),
          })),
          notes: invoice.notes || "",
        }}
        clients={clients}
        clientsLoading={clientsLoading}
        template={undefined}
        templateLoading={false}
        createClientMutation={createClientMutation}
        defaultRate={senderProfile?.defaultRate ?? undefined}
        renderImport={({ addGroups, rateCents }) => (
          <TimeTrackingImportSection onImport={addGroups} getpaidRateCents={rateCents} />
        )}
      />
    </AppLayout>
  );
}
