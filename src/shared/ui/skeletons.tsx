"use client";

import { Box, Paper, Skeleton, Stack } from "@mui/material";

import { UI } from "@app/shared/config/config";

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <Paper sx={{ p: 3, borderRadius: 3, width: "100%" }}>
      <Stack
        direction="row"
        spacing={2}
        sx={{ mb: 2, pb: 2, borderBottom: 1, borderColor: "divider" }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton
            key={i}
            animation="wave"
            variant="text"
            width={`${100 / columns}%`}
            height={24}
          />
        ))}
      </Stack>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <Stack key={rowIndex} direction="row" spacing={2} sx={{ py: 1.5 }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              animation="wave"
              variant="text"
              width={`${100 / columns}%`}
              height={20}
            />
          ))}
        </Stack>
      ))}
    </Paper>
  );
}

export function CardSkeleton() {
  return (
    <Box sx={{ p: 3, bgcolor: "background.paper", borderRadius: 3 }}>
      <Skeleton animation="wave" variant="text" width="60%" height={28} sx={{ mb: 2 }} />
      <Skeleton animation="wave" variant="text" width="100%" height={20} />
      <Skeleton animation="wave" variant="text" width="80%" height={20} />
      <Skeleton animation="wave" variant="text" width="40%" height={20} sx={{ mt: 2 }} />
    </Box>
  );
}

export function InvoiceItemSkeleton() {
  return (
    <Stack direction="row" spacing={3} sx={{ alignItems: "center", py: 2 }}>
      <Skeleton animation="wave" variant="rounded" width={80} height={24} />
      <Box sx={{ flex: 1 }}>
        <Skeleton animation="wave" variant="text" width="40%" height={20} />
        <Skeleton animation="wave" variant="text" width="25%" height={16} />
      </Box>
      <Skeleton animation="wave" variant="text" width={80} height={20} />
      <Skeleton animation="wave" variant="text" width={100} height={20} />
      <Skeleton animation="wave" variant="rounded" width={70} height={24} />
    </Stack>
  );
}

export function StatSkeleton() {
  return (
    <Box sx={{ p: 3, bgcolor: "background.paper", borderRadius: 3 }}>
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Skeleton
          animation="wave"
          variant="circular"
          width={UI.SKELETON_AVATAR_SIZE}
          height={UI.SKELETON_AVATAR_SIZE}
        />
      </Stack>
      <Skeleton animation="wave" variant="text" width="50%" height={16} sx={{ mb: 1 }} />
      <Skeleton animation="wave" variant="text" width="70%" height={36} />
    </Box>
  );
}
