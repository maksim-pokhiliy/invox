"use client";

import { AppLayout } from "@app/shared/layout/app-layout";
import { Breadcrumbs } from "@app/shared/ui/breadcrumbs";

import { WaitlistPageContent } from "@app/features/waitlist-admin/components";

export function WaitlistPageClient() {
  return (
    <AppLayout>
      <Breadcrumbs items={[{ label: "Waitlist" }]} />
      <WaitlistPageContent />
    </AppLayout>
  );
}
