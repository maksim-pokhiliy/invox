"use client";

import { Alert, Button, Stack, Typography } from "@mui/material";

interface DraftBannerProps {
  showBanner: boolean;
  lastSaved: Date | null;
  isDirty: boolean;
  onRestore: () => void;
  onDiscard: () => void;
}

export function InvoiceFormDraftBanner({
  showBanner,
  lastSaved,
  isDirty,
  onRestore,
  onDiscard,
}: DraftBannerProps) {
  return (
    <>
      {showBanner && (
        <Alert
          severity="info"
          sx={{ mb: 3 }}
          action={
            <Stack direction="row" spacing={1}>
              <Button size="small" color="inherit" onClick={onDiscard}>
                Discard
              </Button>
              <Button size="small" variant="contained" onClick={onRestore}>
                Restore
              </Button>
            </Stack>
          }
        >
          You have an unsaved draft. Would you like to restore it?
        </Alert>
      )}

      {lastSaved && isDirty && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mb: 2, textAlign: "right" }}
        >
          Draft saved {lastSaved.toLocaleTimeString()}
        </Typography>
      )}
    </>
  );
}
