"use client";

import {
  Box,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { formatCurrency, formatDateCompact } from "@app/shared/lib/format";
import { calculateTotals, buildDiscountInput } from "@app/shared/lib/calculations";
import { UI } from "@app/shared/config/config";
import type { Template } from "@app/features/templates";

const TEMPLATE_COLUMNS: { id: string; label: string; sortable?: boolean; hideOnMobile: boolean }[] =
  [
    { id: "name", label: "Name", hideOnMobile: false },
    { id: "items", label: "Items", hideOnMobile: true },
    { id: "total", label: "Est. Total", hideOnMobile: false },
    { id: "dueDays", label: "Due Days", sortable: false, hideOnMobile: true },
    { id: "updatedAt", label: "Updated", hideOnMobile: true },
  ];

interface TemplatesTableProps {
  templates: Template[];
  onUseTemplate: (template: Template) => void;
  onMenuOpen: (e: React.MouseEvent<HTMLElement>, id: string) => void;
  calculateEstimatedTotal: (template: Template) => number;
  sortColumn: string;
  sortDirection: "asc" | "desc";
  onSort: (column: string) => void;
}

function TemplateRow({
  template,
  onUseTemplate,
  onMenuOpen,
  calculateEstimatedTotal,
}: {
  template: Template;
  onUseTemplate: (template: Template) => void;
  onMenuOpen: (e: React.MouseEvent<HTMLElement>, id: string) => void;
  calculateEstimatedTotal: (template: Template) => number;
}) {
  return (
    <TableRow hover sx={{ cursor: "pointer" }} onClick={() => onUseTemplate(template)}>
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
      <TableCell align="right">
        <Tooltip title="Actions">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onMenuOpen(e, template.id);
            }}
            aria-label="Template actions"
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
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
  const theme = useTheme();

  return (
    <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
      <TableContainer>
        <Table>
          <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, UI.ALPHA_HOVER) }}>
            <TableRow>
              {TEMPLATE_COLUMNS.map((col) => (
                <TableCell
                  key={col.id}
                  sortDirection={sortColumn === col.id ? sortDirection : false}
                  sx={col.hideOnMobile ? { display: { xs: "none", md: "table-cell" } } : undefined}
                >
                  {col.sortable === false ? (
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {col.label}
                    </Typography>
                  ) : (
                    <TableSortLabel
                      active={sortColumn === col.id}
                      direction={sortColumn === col.id ? sortDirection : "asc"}
                      onClick={() => onSort(col.id)}
                      sx={{ fontWeight: 600 }}
                    >
                      {col.label}
                    </TableSortLabel>
                  )}
                </TableCell>
              ))}
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {templates.map((template) => (
              <TemplateRow
                key={template.id}
                template={template}
                onUseTemplate={onUseTemplate}
                onMenuOpen={onMenuOpen}
                calculateEstimatedTotal={calculateEstimatedTotal}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export function calculateEstimatedTotal(template: Template) {
  const { total } = calculateTotals(
    template.items,
    buildDiscountInput(template.discountType, template.discountValue),
    template.taxRate
  );
  return total;
}
