"use client";

import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { Box } from "@mui/material";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { RESPONSIVE_SX, UI } from "@app/shared/config/config";

interface SortableLineItemRenderProps {
  isDragging: boolean;
  dragHandle: React.ReactNode;
}

interface SortableLineItemProps {
  id: string;
  children: (props: SortableLineItemRenderProps) => React.ReactNode;
}

export function SortableLineItem({ id, children }: SortableLineItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? UI.DRAG_OPACITY : 1,
  };

  const dragHandle = (
    <Box
      {...attributes}
      {...listeners}
      sx={{
        ...RESPONSIVE_SX.DESKTOP_ONLY,
        alignItems: "center",
        justifyContent: "center",
        height: UI.DRAG_HANDLE_HEIGHT,
        cursor: "grab",
        color: "text.secondary",
        "&:hover": { color: "primary.main" },
      }}
    >
      <DragIndicatorIcon fontSize="small" />
    </Box>
  );

  return (
    <Box ref={setNodeRef} style={style}>
      {children({ isDragging, dragHandle })}
    </Box>
  );
}
