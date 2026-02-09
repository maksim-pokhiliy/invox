"use client";

import { useParams, useRouter } from "next/navigation";
import { Alert, Box, Button } from "@mui/material";
import { AppLayout } from "@app/shared/layout/app-layout";
import { Breadcrumbs } from "@app/shared/ui/breadcrumbs";
import { CardSkeleton } from "@app/shared/ui/loading";
import { RecurringForm } from "@app/features/recurring/components";
import { useRecurringInvoice } from "@app/features/recurring";
import { useClients } from "@app/features/clients";

export default function EditRecurringPage() {
  const params = useParams();
  const router = useRouter();
  const recurringId = String(params.id);
  const { data: recurring, isLoading, error } = useRecurringInvoice(recurringId);
  const { data: clients, isLoading: clientsLoading } = useClients();

  if (isLoading) {
    return (
      <AppLayout>
        <CardSkeleton />
      </AppLayout>
    );
  }

  if (error || !recurring) {
    return (
      <AppLayout>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          Failed to load recurring invoice. Please try again.
        </Alert>
        <Box sx={{ mt: 2 }}>
          <Button variant="outlined" onClick={() => router.push("/app/recurring")}>
            Back to Recurring
          </Button>
        </Box>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Breadcrumbs
        items={[
          { label: "Recurring Invoices", href: "/app/recurring" },
          { label: recurring.name },
          { label: "Edit" },
        ]}
      />
      <RecurringForm
        mode="edit"
        recurringId={recurringId}
        clients={clients}
        clientsLoading={clientsLoading}
        initialData={{
          clientId: recurring.client.id,
          name: recurring.name,
          frequency: recurring.frequency,
          currency: recurring.currency,
          discountType: recurring.discountType || "NONE",
          discountValue:
            recurring.discountType === "FIXED"
              ? recurring.discountValue / 100
              : recurring.discountValue,
          taxRate: recurring.taxRate,
          notes: recurring.notes || "",
          dueDays: recurring.dueDays,
          autoSend: recurring.autoSend,
          startDate: recurring.nextRunAt.split("T")[0],
          endDate: recurring.endDate?.split("T")[0] || "",
          items: recurring.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice / 100,
          })),
        }}
      />
    </AppLayout>
  );
}
