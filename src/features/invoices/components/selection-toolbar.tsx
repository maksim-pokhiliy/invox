"use client";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import SendIcon from "@mui/icons-material/Send";
import { alpha, Box, Button, Stack, Typography, useTheme } from "@mui/material";

import { Spinner } from "@app/shared/ui/loading";

interface SelectionToolbarProps {
  count: number;
  isProcessing: boolean;
  onDelete: () => void;
  onExport: () => void;
  onMarkPaid: () => void;
  onSend: () => void;
  onClear: () => void;
}

export function SelectionToolbar({
  count,
  isProcessing,
  onDelete,
  onExport,
  onMarkPaid,
  onSend,
  onClear,
}: SelectionToolbarProps) {
  const theme = useTheme();

  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{
        alignItems: "center",
        px: 2,
        py: 1,
        mb: 2,
        borderRadius: 2.5,
        bgcolor: alpha(theme.palette.primary.main, 0.08),
        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
      }}
    >
      <Typography variant="body2" fontWeight={600} sx={{ mr: 1 }}>
        {count} selected
      </Typography>
      {isProcessing ? (
        <Spinner size={20} />
      ) : (
        <>
          <Button size="small" startIcon={<SendIcon />} onClick={onSend}>
            Send
          </Button>
          <Button size="small" startIcon={<CheckCircleIcon />} onClick={onMarkPaid}>
            Mark Paid
          </Button>
          <Button size="small" startIcon={<DownloadIcon />} onClick={onExport}>
            Export
          </Button>
          <Button size="small" startIcon={<DeleteIcon />} color="error" onClick={onDelete}>
            Delete
          </Button>
        </>
      )}
      <Box sx={{ flexGrow: 1 }} />
      <Button
        size="small"
        startIcon={<CloseIcon />}
        onClick={onClear}
        sx={{ color: "text.secondary" }}
      >
        Clear
      </Button>
    </Stack>
  );
}
