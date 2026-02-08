"use client";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import EditIcon from "@mui/icons-material/Edit";
import { OverflowMenu } from "@app/shared/ui/overflow-menu";

interface InvoicesOverflowMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  selectedInvoiceStatus?: string;
  onViewDetails: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function InvoicesOverflowMenu({
  anchorEl,
  onClose,
  selectedInvoiceStatus,
  onViewDetails,
  onEdit,
  onDuplicate,
  onDelete,
}: InvoicesOverflowMenuProps) {
  return (
    <OverflowMenu
      anchorEl={anchorEl}
      onClose={onClose}
      ariaLabel="Invoice actions"
      items={[
        { label: "View", icon: <OpenInNewIcon fontSize="small" />, onClick: onViewDetails },
        {
          label: "Edit",
          icon: <EditIcon fontSize="small" />,
          onClick: onEdit,
          show: selectedInvoiceStatus === "DRAFT",
        },
        { label: "Duplicate", icon: <ContentCopyIcon fontSize="small" />, onClick: onDuplicate },
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
