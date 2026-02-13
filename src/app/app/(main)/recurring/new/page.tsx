"use client";

import { AppLayout } from "@app/shared/layout/app-layout";
import { Breadcrumbs } from "@app/shared/ui/breadcrumbs";

import { useClients } from "@app/features/clients";
import { RecurringForm } from "@app/features/recurring/components";
import { useSenderProfile } from "@app/features/settings";

export default function NewRecurringPage() {
  const { data: clients, isLoading: clientsLoading } = useClients();
  const { data: senderProfile } = useSenderProfile();

  return (
    <AppLayout>
      <Breadcrumbs
        items={[{ label: "Recurring Invoices", href: "/app/recurring" }, { label: "New" }]}
      />

      <RecurringForm
        clients={clients}
        clientsLoading={clientsLoading}
        defaultCurrency={senderProfile?.defaultCurrency}
      />
    </AppLayout>
  );
}
