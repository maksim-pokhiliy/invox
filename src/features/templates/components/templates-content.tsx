"use client";

import AddIcon from "@mui/icons-material/Add";
import DescriptionIcon from "@mui/icons-material/Description";
import { Button } from "@mui/material";

import { EmptyState } from "@app/shared/ui/empty-state";
import { EmptyTemplatesIllustration } from "@app/shared/ui/illustrations/empty-templates";
import { NoResults } from "@app/shared/ui/no-results";
import { TableSkeleton } from "@app/shared/ui/skeletons";

import type { Template } from "@app/features/templates";

import { TemplatesTable } from "./templates-table";

interface TemplatesContentProps {
  isLoading: boolean;
  templates: Template[] | undefined;
  allTemplatesCount: number;
  searchQuery: string;
  onClearSearch: () => void;
  onUseTemplate: (template: Template) => void;
  onMenuOpen: (e: React.MouseEvent<HTMLElement>, id: string) => void;
  onCreateTemplate: () => void;
  calculateEstimatedTotal: (template: Template) => number;
  sortColumn: string;
  sortDirection: "asc" | "desc";
  onSort: (column: string) => void;
}

export function TemplatesContent({
  isLoading,
  templates,
  allTemplatesCount,
  searchQuery,
  onClearSearch,
  onUseTemplate,
  onMenuOpen,
  onCreateTemplate,
  calculateEstimatedTotal,
  sortColumn,
  sortDirection,
  onSort,
}: TemplatesContentProps) {
  if (isLoading) {
    return <TableSkeleton rows={3} columns={5} />;
  }

  if (allTemplatesCount > 0 && templates && templates.length === 0 && searchQuery) {
    return <NoResults entity="templates" onClear={onClearSearch} />;
  }

  if (templates && templates.length > 0) {
    return (
      <TemplatesTable
        templates={templates}
        onUseTemplate={onUseTemplate}
        onMenuOpen={onMenuOpen}
        calculateEstimatedTotal={calculateEstimatedTotal}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={onSort}
      />
    );
  }

  return (
    <EmptyState
      icon={<DescriptionIcon />}
      illustration={<EmptyTemplatesIllustration />}
      title="No templates yet"
      description="Create a template to quickly generate invoices with predefined items"
      action={
        <Button variant="contained" size="large" startIcon={<AddIcon />} onClick={onCreateTemplate}>
          Create Your First Template
        </Button>
      }
    />
  );
}
