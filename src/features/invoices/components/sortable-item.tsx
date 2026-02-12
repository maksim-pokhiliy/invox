"use client";

import { useForm } from "react-hook-form";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import {
  alpha,
  Box,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import type { InvoiceFormInput } from "@app/shared/schemas";

interface SortableItemProps {
  id: string;
  index: number;
  currency: string;
  canDelete: boolean;
  register: ReturnType<typeof useForm<InvoiceFormInput>>["register"];
  errors: ReturnType<typeof useForm<InvoiceFormInput>>["formState"]["errors"];
  onRemove: () => void;
  onDuplicate: () => void;
}

export function SortableItem({
  id,
  index,
  currency,
  canDelete,
  register,
  errors,
  onRemove,
  onDuplicate,
}: SortableItemProps) {
  const theme = useTheme();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Stack
      ref={setNodeRef}
      style={style}
      direction="row"
      alignItems="start"
      sx={{
        mb: 2,
        p: 1,
        gap: 1.5,
        borderRadius: 2,
        bgcolor: isDragging
          ? alpha(theme.palette.primary.main, 0.08)
          : alpha(theme.palette.primary.main, 0.02),
        cursor: isDragging ? "grabbing" : "default",
      }}
    >
      <Box
        {...attributes}
        {...listeners}
        sx={{
          display: { xs: "none", sm: "flex" },
          alignItems: "center",
          justifyContent: "center",
          height: 40,
          cursor: "grab",
          color: "text.secondary",
          "&:hover": { color: "primary.main" },
        }}
      >
        <DragIndicatorIcon fontSize="small" />
      </Box>
      <TextField
        {...register(`items.${index}.title`)}
        placeholder="Title"
        size="small"
        error={!!errors.items?.[index]?.title}
        helperText={errors.items?.[index]?.title?.message}
        sx={{ flex: 1, minWidth: 120 }}
      />
      <TextField
        {...register(`items.${index}.description`)}
        placeholder="Description"
        size="small"
        sx={{ flex: 2 }}
      />
      <TextField
        {...register(`items.${index}.quantity`, { valueAsNumber: true })}
        type="number"
        placeholder="Qty"
        size="small"
        inputProps={{ min: 0.01, step: 0.01 }}
        error={!!errors.items?.[index]?.quantity}
        sx={{ width: 90 }}
      />
      <TextField
        {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
        type="number"
        placeholder="Rate"
        size="small"
        inputProps={{ min: 0, step: 0.01 }}
        InputProps={{
          startAdornment: (
            <Typography variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>
              {currency}
            </Typography>
          ),
        }}
        error={!!errors.items?.[index]?.unitPrice}
        sx={{ width: 130 }}
      />
      <Box sx={{ display: "flex", gap: 0.5 }}>
        <Tooltip title="Duplicate item">
          <IconButton onClick={onDuplicate} size="small">
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Remove item">
          <span>
            <IconButton onClick={onRemove} disabled={!canDelete} color="error" size="small">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Stack>
  );
}
