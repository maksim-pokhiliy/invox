"use client";

import type { Control, FieldArrayWithId, FieldErrors, UseFormRegister } from "react-hook-form";

import AddIcon from "@mui/icons-material/Add";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import { alpha, Button, Divider, Paper, Stack, Typography, useTheme } from "@mui/material";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  type SensorDescriptor,
  type SensorOptions,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import type { RecurringFormData } from "@app/shared/schemas";
import { FormItemGroup } from "@app/shared/ui/form-item-group";
import { LineItemRow } from "@app/shared/ui/line-item-row";
import { SortableLineItem } from "@app/shared/ui/sortable-line-item";

interface RecurringFormItemsProps {
  fields: FieldArrayWithId<RecurringFormData, "items", "id">[];
  sensors: SensorDescriptor<SensorOptions>[];
  handleDragEnd: (event: DragEndEvent) => void;
  register: UseFormRegister<RecurringFormData>;
  control: Control<RecurringFormData>;
  errors: FieldErrors<RecurringFormData>;
  currency: string;
  subtotal: number;
  onAppend: () => void;
  onRemove: (index: number) => void;
  onDuplicate: (index: number) => void;
  groupFields: FieldArrayWithId<RecurringFormData, "itemGroups", "id">[];
  onRemoveGroup: (index: number) => void;
  onAddGroup: () => void;
}

export function RecurringFormItems({
  fields,
  sensors,
  handleDragEnd,
  register,
  control,
  errors,
  currency,
  subtotal,
  onAppend,
  onRemove,
  onDuplicate,
  groupFields,
  onRemoveGroup,
  onAddGroup,
}: RecurringFormItemsProps) {
  const theme = useTheme();

  return (
    <Paper sx={{ p: 4, borderRadius: 3, mb: 3 }}>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 3 }}>
        Line Items
      </Typography>

      {groupFields.length > 0 && (
        <Stack sx={{ mb: 3 }} spacing={0}>
          {groupFields.map((group, gi) => (
            <FormItemGroup
              key={group.id}
              groupIndex={gi}
              control={control}
              register={register}
              currency={currency}
              onRemoveGroup={() => onRemoveGroup(gi)}
              canDeleteGroup={fields.length > 0 || groupFields.length > 1}
            />
          ))}
        </Stack>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          {fields.map((field, index) => (
            <SortableLineItem key={field.id} id={field.id}>
              {({ isDragging, dragHandle }) => (
                <LineItemRow
                  titleField={register(`items.${index}.title`)}
                  titleError={errors.items?.[index]?.title}
                  descriptionField={register(`items.${index}.description`)}
                  quantityField={register(`items.${index}.quantity`, { valueAsNumber: true })}
                  quantityError={errors.items?.[index]?.quantity}
                  unitPriceField={register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                  unitPriceError={errors.items?.[index]?.unitPrice}
                  currency={currency}
                  onRemove={() => onRemove(index)}
                  canRemove={fields.length > 1 || groupFields.length > 0}
                  onDuplicate={() => onDuplicate(index)}
                  dragHandle={dragHandle}
                  sx={{
                    mb: 2,
                    p: 1,
                    borderRadius: 2,
                    bgcolor: isDragging
                      ? alpha(theme.palette.primary.main, 0.08)
                      : alpha(theme.palette.primary.main, 0.02),
                    cursor: isDragging ? "grabbing" : "default",
                  }}
                />
              )}
            </SortableLineItem>
          ))}
        </SortableContext>
      </DndContext>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 1 }}>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={onAppend}>
          Add Line Item
        </Button>
        <Button variant="outlined" startIcon={<PlaylistAddIcon />} onClick={onAddGroup}>
          Add Group
        </Button>
      </Stack>

      <Divider sx={{ my: 3 }} />

      <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
        <Typography variant="body1">
          Subtotal:{" "}
          <strong>
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency,
            }).format(subtotal)}
          </strong>
        </Typography>
      </Stack>
    </Paper>
  );
}
