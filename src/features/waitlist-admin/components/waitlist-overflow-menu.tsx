"use client";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";

import { OverflowMenu } from "@app/shared/ui/overflow-menu";

interface WaitlistOverflowMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onApprove: () => void;
  onDelete: () => void;
  isPending: boolean;
}

export function WaitlistOverflowMenu({
  anchorEl,
  onClose,
  onApprove,
  onDelete,
  isPending,
}: WaitlistOverflowMenuProps) {
  return (
    <OverflowMenu
      anchorEl={anchorEl}
      onClose={onClose}
      ariaLabel="Waitlist entry actions"
      items={[
        ...(isPending
          ? [
              {
                label: "Approve",
                icon: <CheckCircleIcon fontSize="small" />,
                onClick: onApprove,
                color: "success.main",
              },
            ]
          : []),
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
