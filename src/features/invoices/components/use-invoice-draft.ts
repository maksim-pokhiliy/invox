"use client";

import * as React from "react";
import { useToast } from "@app/shared/ui/toast";
import { useAutosave } from "@app/shared/hooks";
import type { InvoiceFormInput } from "@app/shared/schemas";
import type { UseFormReset } from "react-hook-form";
import { STORAGE_KEYS } from "@app/shared/config/config";
import { storage } from "@app/shared/lib/storage";

const DRAFT_KEY = STORAGE_KEYS.INVOICE_DRAFT;

interface UseInvoiceDraftOptions {
  mode: "create" | "edit";
  formValues: InvoiceFormInput;
  isDirty: boolean;
  reset: UseFormReset<InvoiceFormInput>;
}

export function useInvoiceDraft({ mode, formValues, isDirty, reset }: UseInvoiceDraftOptions) {
  const toast = useToast();
  const [showDraftBanner, setShowDraftBanner] = React.useState(false);
  const isCreateMode = mode === "create";

  const { restoreDraft, clearDraft, lastSaved } = useAutosave({
    key: DRAFT_KEY,
    data: formValues,
    onRestore: (data) => {
      reset(data);
      toast.success("Draft restored");
    },
    enabled: isCreateMode && isDirty,
  });

  React.useEffect(() => {
    if (!isCreateMode) {
      return;
    }
    if (storage.get(DRAFT_KEY)) {
      setShowDraftBanner(true);
    }
  }, [isCreateMode]);

  const handleRestoreDraft = React.useCallback(() => {
    restoreDraft();
    setShowDraftBanner(false);
  }, [restoreDraft]);

  const handleDiscardDraft = React.useCallback(() => {
    clearDraft();
    setShowDraftBanner(false);
  }, [clearDraft]);

  return {
    showDraftBanner,
    lastSaved,
    clearDraft,
    handleRestoreDraft,
    handleDiscardDraft,
  };
}
