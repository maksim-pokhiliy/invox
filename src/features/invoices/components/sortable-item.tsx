"use client";

import { Box, IconButton, TextField, Typography, Tooltip, alpha, useTheme } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useForm } from "react-hook-form";
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
    <Box
      ref={setNodeRef}
      style={style}
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "24px 2fr 100px 120px 72px" },
        gap: 2,
        mb: 2,
        alignItems: "start",
        p: 1,
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
        {...register(`items.${index}.description`)}
        placeholder="Item description"
        label={undefined}
        size="small"
        error={!!errors.items?.[index]?.description}
        helperText={errors.items?.[index]?.description?.message}
        sx={{ "& .MuiInputBase-root": { display: { xs: "flex", sm: "flex" } } }}
      />
      <TextField
        {...register(`items.${index}.quantity`, { valueAsNumber: true })}
        type="number"
        label="Qty"
        size="small"
        inputProps={{ min: 1 }}
        error={!!errors.items?.[index]?.quantity}
        sx={{ "& label": { display: { sm: "none" } } }}
      />
      <TextField
        {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
        type="number"
        label="Price"
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
        sx={{ "& label": { display: { sm: "none" } } }}
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
    </Box>
  );
}
