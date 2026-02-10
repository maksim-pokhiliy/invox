"use client";

import { Box, Button, Typography, Divider } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  SensorDescriptor,
  SensorOptions,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { FieldArrayWithId, UseFormRegister, FieldErrors } from "react-hook-form";
import type { InvoiceFormInput } from "@app/shared/schemas";
import { SortableItem } from "./sortable-item";

interface InvoiceFormLineItemsProps {
  fields: FieldArrayWithId<InvoiceFormInput, "items", "id">[];
  sensors: SensorDescriptor<SensorOptions>[];
  handleDragEnd: (event: DragEndEvent) => void;
  register: UseFormRegister<InvoiceFormInput>;
  errors: FieldErrors<InvoiceFormInput>;
  currency: string;
  onAppend: () => void;
  onRemove: (index: number) => void;
  onDuplicate: (index: number) => void;
}

export function InvoiceFormLineItems({
  fields,
  sensors,
  handleDragEnd,
  register,
  errors,
  currency,
  onAppend,
  onRemove,
  onDuplicate,
}: InvoiceFormLineItemsProps) {
  return (
    <>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
        Line Items
      </Typography>

      <Box
        sx={{
          display: { xs: "none", sm: "grid" },
          gridTemplateColumns: "24px 2fr 100px 120px 72px",
          gap: 2,
          mb: 1,
          px: 1,
        }}
      >
        <Box />
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          Description
        </Typography>
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          Quantity
        </Typography>
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          Unit Price
        </Typography>
        <Box />
      </Box>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          {fields.map((field, index) => (
            <SortableItem
              key={field.id}
              id={field.id}
              index={index}
              currency={currency}
              canDelete={fields.length > 1}
              register={register}
              errors={errors}
              onRemove={() => onRemove(index)}
              onDuplicate={() => onDuplicate(index)}
            />
          ))}
        </SortableContext>
      </DndContext>

      <Button variant="outlined" startIcon={<AddIcon />} onClick={onAppend} sx={{ mb: 4 }}>
        Add Line Item
      </Button>

      <Divider sx={{ my: 4 }} />
    </>
  );
}
