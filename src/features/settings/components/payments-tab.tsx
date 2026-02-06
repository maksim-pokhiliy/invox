"use client";

import { Box, Typography, Divider, Stack } from "@mui/material";
import {
  ConnectionList,
  ConnectBankButton,
  PendingMatches,
} from "@app/features/banking/components";

export function PaymentsTab() {
  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h6" fontWeight={600}>
            Connected Banks
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Connect your bank to automatically detect incoming payments
          </Typography>
        </Box>
        <ConnectBankButton />
      </Stack>

      <ConnectionList />

      <Divider sx={{ my: 4 }} />

      <PendingMatches />
    </Box>
  );
}
