"use client";

import { Box, Button } from "@mui/material";
import { LoadingButton } from "./loading-button";

interface FormActionsProps {
  onCancel: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  disabled?: boolean;
}

export function FormActions({
  onCancel,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  loading = false,
  disabled = false,
}: FormActionsProps) {
  return (
    <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
      <Button variant="outlined" onClick={onCancel} disabled={loading}>
        {cancelLabel}
      </Button>
      <LoadingButton type="submit" variant="contained" loading={loading} disabled={disabled}>
        {submitLabel}
      </LoadingButton>
    </Box>
  );
}
