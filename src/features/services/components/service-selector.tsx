"use client";

import * as React from "react";

import { Autocomplete, Stack, TextField, Typography } from "@mui/material";

import { formatCents } from "@app/shared/lib/format";
import type { Service } from "@app/shared/schemas/api";
import { toDollars } from "@app/shared/types/money";

import { useServices } from "../hooks";

interface ServiceSelectorProps {
  onSelect: (item: {
    serviceId: string;
    title: string;
    description: string;
    quantity: number;
    unitPrice: number;
  }) => void;
  currency: string;
}

export function ServiceSelector({ onSelect, currency }: ServiceSelectorProps) {
  const { data: services, isLoading } = useServices();
  const [value, setValue] = React.useState<Service | null>(null);

  const activeServices = React.useMemo(() => services?.filter((s) => s.active) ?? [], [services]);

  const handleSelect = (_event: React.SyntheticEvent, service: Service | null) => {
    if (!service) {
      return;
    }

    onSelect({
      serviceId: service.id,
      title: service.name,
      description: service.description || "",
      quantity: 1,
      unitPrice: toDollars(service.defaultPrice),
    });

    setValue(null);
  };

  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems="flex-start">
      <Autocomplete
        value={value}
        onChange={handleSelect}
        options={activeServices}
        loading={isLoading}
        getOptionLabel={(option) => option.name}
        isOptionEqualToValue={(option, val) => option.id === val.id}
        renderOption={(props, option) => {
          const { key, ...rest } = props;

          return (
            <li key={key} {...rest}>
              <Stack direction="row" sx={{ justifyContent: "space-between", width: "100%" }}>
                <Stack>
                  <Typography variant="body2" fontWeight={500}>
                    {option.name}
                  </Typography>
                  {option.description && (
                    <Typography variant="caption" color="text.secondary">
                      {option.description}
                    </Typography>
                  )}
                </Stack>
                <Stack sx={{ alignItems: "flex-end", flexShrink: 0, ml: 2 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {formatCents(option.defaultPrice, currency)}
                  </Typography>
                  {option.unit && (
                    <Typography variant="caption" color="text.secondary">
                      / {option.unit}
                    </Typography>
                  )}
                </Stack>
              </Stack>
            </li>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Add from Service Catalog"
            size="small"
            sx={{ minWidth: 280, maxWidth: 480 }}
          />
        )}
        noOptionsText="No active services found"
        sx={{ minWidth: 280, maxWidth: 480 }}
      />
    </Stack>
  );
}
