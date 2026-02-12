"use client";

import * as React from "react";
import type { Control, UseFormRegister } from "react-hook-form";
import { useFieldArray } from "react-hook-form";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  alpha,
  Box,
  Button,
  Collapse,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";

import { SORT_ORDER } from "@app/shared/config/config";
import type { InvoiceFormInput } from "@app/shared/schemas";

interface InvoiceFormGroupProps {
  groupIndex: number;
  control: Control<InvoiceFormInput>;
  register: UseFormRegister<InvoiceFormInput>;
  currency: string;
  onRemoveGroup: () => void;
  canDeleteGroup: boolean;
  defaultUnitPrice: number;
}

export function InvoiceFormGroup({
  groupIndex,
  control,
  register,
  currency,
  onRemoveGroup,
  canDeleteGroup,
  defaultUnitPrice,
}: InvoiceFormGroupProps) {
  const theme = useTheme();
  const [expanded, setExpanded] = React.useState(true);
  const { fields, remove, append } = useFieldArray({
    control,
    name: `itemGroups.${groupIndex}.items`,
  });

  return (
    <Box
      sx={{
        mb: 2,
        borderRadius: 2,
        border: 1,
        borderColor: alpha(theme.palette.primary.main, 0.2),
        overflow: "hidden",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        sx={{
          px: 2,
          py: 1,
          bgcolor: alpha(theme.palette.primary.main, 0.06),
          gap: 1,
        }}
      >
        <IconButton size="small" onClick={() => setExpanded((prev) => !prev)}>
          {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </IconButton>
        <TextField
          {...register(`itemGroups.${groupIndex}.title`)}
          variant="standard"
          size="small"
          placeholder="Group title"
          InputProps={{ disableUnderline: true, sx: { fontWeight: 600, fontSize: "0.875rem" } }}
          sx={{ flex: 1 }}
        />
        <Typography variant="caption" color="text.secondary">
          {fields.length} {fields.length === 1 ? "item" : "items"}
        </Typography>
        <Tooltip title="Remove group">
          <span>
            <IconButton
              size="small"
              color="error"
              onClick={onRemoveGroup}
              disabled={!canDeleteGroup}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>

      <Collapse in={expanded}>
        {fields.map((field, itemIndex) => (
          <Stack
            key={field.id}
            direction="row"
            alignItems="start"
            sx={{
              px: 2,
              py: 1,
              gap: 1.5,
              borderTop: 1,
              borderColor: "divider",
            }}
          >
            <TextField
              {...register(`itemGroups.${groupIndex}.items.${itemIndex}.title`)}
              placeholder="Title"
              size="small"
              sx={{ flex: 1, minWidth: 120 }}
            />
            <TextField
              {...register(`itemGroups.${groupIndex}.items.${itemIndex}.description`)}
              placeholder="Description"
              size="small"
              sx={{ flex: 2 }}
            />
            <TextField
              {...register(`itemGroups.${groupIndex}.items.${itemIndex}.quantity`, {
                valueAsNumber: true,
              })}
              type="number"
              placeholder="Qty"
              size="small"
              inputProps={{ min: 0.01, step: 0.01 }}
              sx={{ width: 90 }}
            />
            <TextField
              {...register(`itemGroups.${groupIndex}.items.${itemIndex}.unitPrice`, {
                valueAsNumber: true,
              })}
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
              sx={{ width: 130 }}
            />
            <Tooltip title="Remove item">
              <span>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => remove(itemIndex)}
                  disabled={fields.length <= 1}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        ))}

        <Box sx={{ px: 2, py: 1, borderTop: 1, borderColor: "divider" }}>
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={() =>
              append({
                title: "",
                description: "",
                quantity: 1,
                unitPrice: defaultUnitPrice,
                sortOrder: fields.length * SORT_ORDER.GAP,
              })
            }
          >
            Add Item
          </Button>
        </Box>
      </Collapse>
    </Box>
  );
}
