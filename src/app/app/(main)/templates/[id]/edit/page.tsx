"use client";

import { useParams, useRouter } from "next/navigation";
import { Alert, Box, Button } from "@mui/material";
import { AppLayout } from "@app/shared/layout/app-layout";
import { Breadcrumbs } from "@app/shared/ui/breadcrumbs";
import { CardSkeleton } from "@app/shared/ui/loading";
import { TemplateForm } from "@app/features/templates/components";
import { useTemplate } from "@app/features/templates";

export default function EditTemplatePage() {
  const params = useParams();
  const router = useRouter();
  const templateId = String(params.id);
  const { data: template, isLoading, error } = useTemplate(templateId);

  if (isLoading) {
    return (
      <AppLayout>
        <CardSkeleton />
      </AppLayout>
    );
  }

  if (error || !template) {
    return (
      <AppLayout>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          Failed to load template. Please try again.
        </Alert>
        <Box sx={{ mt: 2 }}>
          <Button variant="outlined" onClick={() => router.push("/app/templates")}>
            Back to Templates
          </Button>
        </Box>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Breadcrumbs
        items={[
          { label: "Templates", href: "/app/templates" },
          { label: template.name },
          { label: "Edit" },
        ]}
      />
      <TemplateForm
        mode="edit"
        templateId={templateId}
        initialData={{
          name: template.name,
          description: template.description || "",
          currency: template.currency,
          discountType: template.discountType || "",
          discountValue:
            template.discountType === "FIXED"
              ? template.discountValue / 100
              : template.discountValue,
          taxRate: template.taxRate,
          notes: template.notes || "",
          dueDays: template.dueDays,
          items: template.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice / 100,
          })),
        }}
      />
    </AppLayout>
  );
}
