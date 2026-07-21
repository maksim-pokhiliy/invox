"use client";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";

import { OverflowMenu } from "@app/shared/ui/overflow-menu";

interface ServicesOverflowMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onEdit: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
  isActive: boolean;
}

export function ServicesOverflowMenu({
  anchorEl,
  onClose,
  onEdit,
  onToggleActive,
  onDelete,
  isActive,
}: ServicesOverflowMenuProps) {
  return (
    <OverflowMenu
      anchorEl={anchorEl}
      onClose={onClose}
      ariaLabel="Service actions"
      items={[
        { label: "Edit", icon: <EditIcon fontSize="small" />, onClick: onEdit },
        {
          label: isActive ? "Deactivate" : "Activate",
          icon: isActive ? <ToggleOffIcon fontSize="small" /> : <ToggleOnIcon fontSize="small" />,
          onClick: onToggleActive,
        },
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
