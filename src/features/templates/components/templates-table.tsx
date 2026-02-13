"use client";

import { Box, Chip, TableCell, Typography } from "@mui/material";

import { formatCurrency, formatDateCompact } from "@app/shared/lib/format";
import { DataTable, DataTableActions, DataTableRow } from "@app/shared/ui/data-table";

import type { Template } from "@app/features/templates";

import { TEMPLATE_COLUMNS } from "../constants";

interface TemplatesTableProps {
  templates: Template[];
  onUseTemplate: (template: Template) => void;
  onMenuOpen: (e: React.MouseEvent<HTMLElement>, id: string) => void;
  calculateEstimatedTotal: (template: Template) => number;
  sortColumn: string;
  sortDirection: "asc" | "desc";
  onSort: (column: string) => void;
}

export function TemplatesTable({
  templates,
  onUseTemplate,
  onMenuOpen,
  calculateEstimatedTotal,
  sortColumn,
  sortDirection,
  onSort,
}: TemplatesTableProps) {
  return (
    <DataTable
      columns={TEMPLATE_COLUMNS}
      sortColumn={sortColumn}
      sortDirection={sortDirection}
      onSort={onSort}
    >
      {templates.map((template) => (
        <DataTableRow key={template.id} onClick={() => onUseTemplate(template)}>
          <TableCell>
            <Box>
              <Typography fontWeight={600}>{template.name}</Typography>
              {template.description && (
                <Typography variant="caption" color="text.secondary">
                  {template.description}
                </Typography>
              )}
            </Box>
          </TableCell>
          <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
            <Chip
              label={`${template.items.length} item${template.items.length !== 1 ? "s" : ""}`}
              size="small"
            />
          </TableCell>
          <TableCell>
            <Typography fontWeight={500}>
              {formatCurrency(calculateEstimatedTotal(template), template.currency)}
            </Typography>
          </TableCell>
          <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
            <Chip label={`${template.dueDays} days`} size="small" variant="outlined" />
          </TableCell>
          <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
            <Typography variant="body2" color="text.secondary">
              {formatDateCompact(template.updatedAt)}
            </Typography>
          </TableCell>
          <DataTableActions
            onMenuOpen={(e) => onMenuOpen(e, template.id)}
            ariaLabel={`Actions for ${template.name}`}
          />
        </DataTableRow>
      ))}
    </DataTable>
  );
}
