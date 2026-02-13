"use client";

import { Box, InputBase, Stack, TextField, Typography } from "@mui/material";

import { UI } from "@app/shared/config/config";

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {label}
      </Typography>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <InputBase
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          sx={{
            width: UI.COLOR_PICKER_SIZE,
            height: UI.COLOR_PICKER_SIZE,
            border: 1,
            borderColor: "divider",
            borderRadius: 1,
            cursor: "pointer",
            p: 0.5,
            "& input[type='color']": {
              p: 0,
              border: "none",
              cursor: "inherit",
            },
          }}
        />
        <TextField
          size="small"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          sx={{ width: 120 }}
          slotProps={{
            htmlInput: { pattern: "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$" },
          }}
        />
      </Stack>
    </Box>
  );
}
