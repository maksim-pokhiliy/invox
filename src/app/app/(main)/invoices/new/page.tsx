"use client";

import { useSearchParams } from "next/navigation";
import { AppLayout } from "@app/shared/layout/app-layout";
import { Breadcrumbs } from "@app/shared/ui/breadcrumbs";
import { InvoiceForm } from "@app/features/invoices/components";
import { useClients, useCreateClient } from "@app/features/clients";
import { useTemplate } from "@app/features/templates";
import { useSenderProfile } from "@app/features/settings";

export default function NewInvoicePage() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get("templateId") || undefined;

  const { data: clients, isLoading: clientsLoading } = useClients();
  const { data: template, isLoading: templateLoading } = useTemplate(templateId ?? "");
  const createClientMutation = useCreateClient();
  const { data: senderProfile } = useSenderProfile();

  return (
    <AppLayout>
      <Breadcrumbs
        items={[{ label: "Invoices", href: "/app/invoices" }, { label: "New Invoice" }]}
      />
      <InvoiceForm
        mode="create"
        templateId={templateId}
        clients={clients}
        clientsLoading={clientsLoading}
        template={template}
        templateLoading={templateLoading}
        createClientMutation={createClientMutation}
        defaultRate={senderProfile?.defaultRate ?? undefined}
      />
    </AppLayout>
  );
}
