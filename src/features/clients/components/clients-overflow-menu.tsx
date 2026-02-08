"use client";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { OverflowMenu } from "@app/shared/ui/overflow-menu";

interface ClientsOverflowMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ClientsOverflowMenu({
  anchorEl,
  onClose,
  onEdit,
  onDelete,
}: ClientsOverflowMenuProps) {
  return (
    <OverflowMenu
      anchorEl={anchorEl}
      onClose={onClose}
      ariaLabel="Client actions"
      items={[
        { label: "Edit", icon: <EditIcon fontSize="small" />, onClick: onEdit },
        {
          label: "Delete",
          icon: <DeleteIcon fontSize="small" />,
          onClick: onDelete,
          color: "error.main",
        },
      ]}
    />
  );
}
