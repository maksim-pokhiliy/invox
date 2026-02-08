"use client";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import ReceiptIcon from "@mui/icons-material/Receipt";
import type { RecurringInvoice } from "@app/features/recurring";
import { OverflowMenu } from "@app/shared/ui/overflow-menu";

interface RecurringOverflowMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  selectedItem: RecurringInvoice | null;
  onEdit: () => void;
  onToggleStatus: () => void;
  onGenerateNow: () => void;
  onDelete: () => void;
}

export function RecurringOverflowMenu({
  anchorEl,
  onClose,
  selectedItem,
  onEdit,
  onToggleStatus,
  onGenerateNow,
  onDelete,
}: RecurringOverflowMenuProps) {
  const isActive = selectedItem?.status === "ACTIVE";

  return (
    <OverflowMenu
      anchorEl={anchorEl}
      onClose={onClose}
      items={[
        { label: "Edit", icon: <EditIcon fontSize="small" />, onClick: onEdit },
        {
          label: isActive ? "Pause" : "Activate",
          icon: isActive ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />,
          onClick: onToggleStatus,
          show: selectedItem?.status !== "CANCELED",
        },
        {
          label: "Generate Now",
          icon: <ReceiptIcon fontSize="small" />,
          onClick: onGenerateNow,
          show: isActive,
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
