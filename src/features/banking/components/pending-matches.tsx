"use client";

import { useState } from "react";

import SyncAltIcon from "@mui/icons-material/SyncAlt";
import { Box, Stack, Typography } from "@mui/material";

import { EmptyState } from "@app/shared/ui/empty-state";
import { CardSkeleton } from "@app/shared/ui/skeletons";

import { useConfirmMatch, useIgnoreTransaction, usePendingTransactions } from "../hooks";
import { MatchCard } from "./match-card";

export function PendingMatches() {
  const { data, isLoading } = usePendingTransactions();
  const confirmMatch = useConfirmMatch();
  const ignoreTransaction = useIgnoreTransaction();
  const [activeId, setActiveId] = useState<string | null>(null);

  const confirmingId = confirmMatch.isPending ? activeId : null;
  const ignoringId = ignoreTransaction.isPending ? activeId : null;

  const handleConfirm = (transactionId: string, invoiceId: string) => {
    setActiveId(transactionId);
    confirmMatch.mutate({ transactionId, invoiceId });
  };

  const handleIgnore = (transactionId: string) => {
    setActiveId(transactionId);
    ignoreTransaction.mutate(transactionId);
  };

  if (isLoading) {
    return (
      <Stack spacing={1.5}>
        <CardSkeleton />
        <CardSkeleton />
      </Stack>
    );
  }

  const pending = data?.pending ?? [];
  const autoMatched = data?.autoMatched ?? [];

  return (
    <Box>
      {pending.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Pending Matches ({pending.length})
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Review and confirm suggested payment matches
          </Typography>
          <Stack spacing={1.5}>
            {pending.map((tx) => (
              <MatchCard
                key={tx.id}
                transaction={tx}
                onConfirm={handleConfirm}
                onIgnore={handleIgnore}
                confirmingId={confirmingId}
                ignoringId={ignoringId}
              />
            ))}
          </Stack>
        </Box>
      )}

      {autoMatched.length > 0 && (
        <Box>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Recent Auto-Matched
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Payments that were automatically matched to invoices
          </Typography>
          <Stack spacing={1.5}>
            {autoMatched.map((tx) => (
              <MatchCard
                key={tx.id}
                transaction={tx}
                onConfirm={handleConfirm}
                onIgnore={handleIgnore}
                confirmingId={confirmingId}
                ignoringId={ignoringId}
              />
            ))}
          </Stack>
        </Box>
      )}

      {pending.length === 0 && autoMatched.length === 0 && (
        <EmptyState
          icon={<SyncAltIcon />}
          title="No transaction matches"
          description="Matches will appear here automatically after your bank syncs new transactions."
        />
      )}
    </Box>
  );
}
