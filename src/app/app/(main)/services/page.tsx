"use client";

import { AppLayout } from "@app/shared/layout/app-layout";
import { Breadcrumbs } from "@app/shared/ui/breadcrumbs";

import { ServicesPageContent } from "@app/features/services/components";

export default function ServicesPage() {
  return (
    <AppLayout>
      <Breadcrumbs items={[{ label: "Services" }]} />
      <ServicesPageContent />
    </AppLayout>
  );
}
