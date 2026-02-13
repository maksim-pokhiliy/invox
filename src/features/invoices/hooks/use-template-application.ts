"use client";

import * as React from "react";

import { useToast } from "@app/shared/hooks/use-toast";
import type { InvoiceFormInput } from "@app/shared/schemas";

import { getTemplateDueDate } from "../lib/invoice-calculations";
import type { InvoiceFormMode, TemplateData } from "../types";

export function useTemplateApplication(
  mode: InvoiceFormMode,
  template: TemplateData | undefined,
  templateLoading: boolean,
  reset: (values: InvoiceFormInput) => void
) {
  const toast = useToast();
  const [templateApplied, setTemplateApplied] = React.useState(false);

  React.useEffect(() => {
    if (mode === "create" && template && !templateApplied && !templateLoading) {
      reset({
        clientId: "",
        currency: template.currency,
        dueDate: getTemplateDueDate(template.dueDays),
        items: template.items.map((item) => ({
          title: item.title,
          description: item.description ?? "",
          quantity: item.quantity,
          unitPrice: item.unitPrice / 100,
        })),
        itemGroups: template.itemGroups.map((group) => ({
          title: group.title,
          items: group.items.map((item) => ({
            title: item.title,
            description: item.description ?? "",
            quantity: item.quantity,
            unitPrice: item.unitPrice / 100,
          })),
        })),
        notes: template.notes || "",
      });
      setTemplateApplied(true);
      toast.success(`Template "${template.name}" applied`);
    }
  }, [mode, template, templateApplied, templateLoading, reset, toast]);
}
