"use client";

import { AppLayout } from "@app/shared/layout/app-layout";
import { Breadcrumbs } from "@app/shared/ui/breadcrumbs";
import { RecurringForm } from "@app/features/recurring/components";
import { useClients } from "@app/features/clients";

export default function NewRecurringPage() {
  const { data: clients, isLoading: clientsLoading } = useClients();

  return (
    <AppLayout>
      <Breadcrumbs
        items={[{ label: "Recurring Invoices", href: "/app/recurring" }, { label: "New" }]}
      />
      <RecurringForm clients={clients} clientsLoading={clientsLoading} />
    </AppLayout>
  );
}
