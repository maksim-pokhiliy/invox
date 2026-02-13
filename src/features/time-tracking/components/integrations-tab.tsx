"use client";

import { Box, Stack, Typography } from "@mui/material";

import { CardSkeleton } from "@app/shared/ui/skeletons";

import { useTimeTrackingConnections, useTimeTrackingProviders } from "../hooks";
import { ProviderCard } from "./provider-card";

export function IntegrationsTab() {
  const { data: providers, isLoading: providersLoading } = useTimeTrackingProviders();
  const { data: connections, isLoading: connectionsLoading } = useTimeTrackingConnections();

  const isLoading = providersLoading || connectionsLoading;

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          Time Tracking
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Connect your time tracker to import hours directly into invoices
        </Typography>
      </Box>

      {isLoading ? (
        <CardSkeleton />
      ) : (
        <Stack spacing={1.5}>
          {providers?.map((provider) => {
            const connection = connections?.find((c) => c.provider === provider.id) ?? null;

            return (
              <ProviderCard
                key={provider.id}
                providerId={provider.id}
                providerName={provider.name}
                connection={connection}
              />
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
