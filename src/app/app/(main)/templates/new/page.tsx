"use client";

import { AppLayout } from "@app/shared/layout/app-layout";
import { Breadcrumbs } from "@app/shared/ui/breadcrumbs";

import { useSenderProfile } from "@app/features/settings";
import { TemplateForm } from "@app/features/templates/components";

export default function NewTemplatePage() {
  const { data: senderProfile } = useSenderProfile();

  return (
    <AppLayout>
      <Breadcrumbs
        items={[{ label: "Templates", href: "/app/templates" }, { label: "New Template" }]}
      />

      <TemplateForm defaultCurrency={senderProfile?.defaultCurrency} />
    </AppLayout>
  );
}
