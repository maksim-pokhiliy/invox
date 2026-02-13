"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import { AppLayout } from "@app/shared/layout/app-layout";
import { CardSkeleton } from "@app/shared/ui/skeletons";

export default function RecurringDetailPage() {
  const params = useParams();
  const router = useRouter();
  const recurringId = String(params.id);

  useEffect(() => {
    router.replace(`/app/recurring/${recurringId}/edit`);
  }, [router, recurringId]);

  return (
    <AppLayout>
      <CardSkeleton />
    </AppLayout>
  );
}
