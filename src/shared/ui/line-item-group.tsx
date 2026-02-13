"use client";

import * as React from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

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

interface LineItemGroupProps {
  groupTitleField: UseFormRegisterReturn;
  itemCount: number;
  onRemoveGroup: () => void;
  canDeleteGroup: boolean;
  onAddItem: () => void;
  children: React.ReactNode;
}

export function LineItemGroup({
  groupTitleField,
  itemCount,
  onRemoveGroup,
  canDeleteGroup,
  onAddItem,
  children,
}: LineItemGroupProps) {
  const theme = useTheme();
  const [expanded, setExpanded] = React.useState(true);

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
        spacing={1}
        alignItems="center"
        sx={{
          px: 2,
          py: 1,
          bgcolor: alpha(theme.palette.primary.main, 0.06),
        }}
      >
        <IconButton size="small" onClick={() => setExpanded((prev) => !prev)}>
          {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </IconButton>
        <TextField
          {...groupTitleField}
          inputRef={groupTitleField.ref}
          variant="standard"
          size="small"
          fullWidth
          placeholder="Group title"
          slotProps={{ input: { disableUnderline: true, sx: { fontWeight: 600 } } }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
          {itemCount} {itemCount === 1 ? "item" : "items"}
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
        {children}

        <Box sx={{ px: 2, py: 1, borderTop: 1, borderColor: "divider" }}>
          <Button size="small" startIcon={<AddIcon />} onClick={onAddItem}>
            Add Item
          </Button>
        </Box>
      </Collapse>
    </Box>
  );
}
