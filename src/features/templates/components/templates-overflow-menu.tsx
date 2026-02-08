"use client";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { OverflowMenu } from "@app/shared/ui/overflow-menu";
import type { Template } from "@app/features/templates";

interface TemplatesOverflowMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  selectedTemplate: Template | undefined;
  onUseTemplate: (template: Template) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function TemplatesOverflowMenu({
  anchorEl,
  onClose,
  selectedTemplate,
  onUseTemplate,
  onEdit,
  onDelete,
}: TemplatesOverflowMenuProps) {
  return (
    <OverflowMenu
      anchorEl={anchorEl}
      onClose={onClose}
      items={[
        {
          label: "Use Template",
          icon: <ContentCopyIcon fontSize="small" />,
          onClick: () => selectedTemplate && onUseTemplate(selectedTemplate),
        },
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
