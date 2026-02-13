"use client";

import type { UseFormRegisterReturn } from "react-hook-form";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Grid,
  IconButton,
  Stack,
  type SxProps,
  TextField,
  type Theme,
  Tooltip,
  Typography,
} from "@mui/material";

interface FieldError {
  message?: string;
}

function spreadField({ ref, ...rest }: UseFormRegisterReturn) {
  return { ...rest, inputRef: ref };
}

interface LineItemRowProps {
  titleField: UseFormRegisterReturn;
  titleError?: FieldError;
  descriptionField: UseFormRegisterReturn;
  quantityField: UseFormRegisterReturn;
  quantityError?: FieldError;
  unitPriceField: UseFormRegisterReturn;
  unitPriceError?: FieldError;
  currency: string;
  onRemove: () => void;
  canRemove: boolean;
  onDuplicate?: () => void;
  dragHandle?: React.ReactNode;
  sx?: SxProps<Theme>;
}

export function LineItemRow({
  titleField,
  titleError,
  descriptionField,
  quantityField,
  quantityError,
  unitPriceField,
  unitPriceError,
  currency,
  onRemove,
  canRemove,
  onDuplicate,
  dragHandle,
  sx,
}: LineItemRowProps) {
  return (
    <Grid container spacing={1.5} sx={{ alignItems: "center", ...sx }}>
      {dragHandle && (
        <Grid size="auto" sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}>
          {dragHandle}
        </Grid>
      )}

      <Grid size={{ xs: 12, md: 3 }}>
        <TextField
          {...spreadField(titleField)}
          placeholder="Title"
          size="small"
          fullWidth
          error={!!titleError}
          helperText={titleError?.message}
        />
      </Grid>

      <Grid size={{ xs: 12, md: "grow" }}>
        <TextField
          {...spreadField(descriptionField)}
          placeholder="Description"
          size="small"
          fullWidth
        />
      </Grid>

      <Grid size={{ xs: 3, md: 1.5 }}>
        <TextField
          {...spreadField(quantityField)}
          type="number"
          placeholder="Qty"
          size="small"
          fullWidth
          slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }}
          error={!!quantityError}
        />
      </Grid>

      <Grid size={{ xs: 5, md: 1.5 }}>
        <TextField
          {...spreadField(unitPriceField)}
          type="number"
          placeholder="Rate"
          size="small"
          fullWidth
          slotProps={{
            htmlInput: { min: 0, step: 0.01 },
            input: {
              startAdornment: (
                <Typography variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>
                  {currency}
                </Typography>
              ),
            },
          }}
          error={!!unitPriceError}
        />
      </Grid>

      <Grid size={{ xs: 4, md: "auto" }}>
        <Stack
          direction="row"
          spacing={0.5}
          sx={{ justifyContent: { xs: "flex-end", md: "start" } }}
        >
          {onDuplicate && (
            <Tooltip title="Duplicate item">
              <IconButton onClick={onDuplicate} size="small">
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Remove item">
            <span>
              <IconButton onClick={onRemove} disabled={!canRemove} color="error" size="small">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Grid>
    </Grid>
  );
}
