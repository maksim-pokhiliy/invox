"use client";

import { useParams, useRouter } from "next/navigation";
import { Box, Button, Alert } from "@mui/material";
import { AppLayout } from "@app/shared/layout/app-layout";
import { Breadcrumbs } from "@app/shared/ui/breadcrumbs";
import { CardSkeleton } from "@app/shared/ui/loading";
import { InvoiceForm } from "@app/features/invoices/components";
import { useInvoice } from "@app/features/invoices";
import { useClients, useCreateClient } from "@app/features/clients";

export default function EditInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = String(params.id);
  const { data: invoice, isLoading, error } = useInvoice(invoiceId);
  const { data: clients, isLoading: clientsLoading } = useClients();
  const createClientMutation = useCreateClient();

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
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice / 100,
          })),
          notes: invoice.notes || "",
        }}
        clients={clients}
        clientsLoading={clientsLoading}
        template={undefined}
        templateLoading={false}
        createClientMutation={createClientMutation}
      />
    </AppLayout>
  );
}
