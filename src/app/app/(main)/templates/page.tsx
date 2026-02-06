"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Chip,
  alpha,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DescriptionIcon from "@mui/icons-material/Description";
import { AppLayout } from "@app/shared/layout/app-layout";
import { Breadcrumbs } from "@app/shared/ui/breadcrumbs";
import { EmptyState } from "@app/shared/ui/empty-state";
import { TableSkeleton } from "@app/shared/ui/loading";
import { useToast } from "@app/shared/ui/toast";
import { ConfirmDialog, useConfirmDialog } from "@app/shared/ui/confirm-dialog";
import { useTemplates, useDeleteTemplate, type Template } from "@app/features/templates";
import { formatCurrency, formatDateCompact } from "@app/shared/lib/format";

export default function TemplatesPage() {
  const router = useRouter();
  const toast = useToast();
  const { confirm, dialogProps } = useConfirmDialog();

  const { data: templates, isLoading, error } = useTemplates();
  const deleteMutation = useDeleteTemplate();

  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string | null>(null);

  const selectedTemplate = templates?.find((t) => t.id === selectedTemplateId);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, templateId: string) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedTemplateId(templateId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedTemplateId(null);
  };

  const handleDelete = () => {
    if (!selectedTemplate) {
      return;
    }
    handleMenuClose();
    confirm({
      title: "Delete Template",
      message: `Are you sure you want to delete "${selectedTemplate.name}"? This action cannot be undone.`,
      confirmText: "Delete",
      confirmColor: "error",
      onConfirm: async () => {
        await deleteMutation.mutateAsync(selectedTemplate.id);
        toast.success("Template deleted successfully");
      },
    });
  };

  const handleEdit = () => {
    if (!selectedTemplate) {
      return;
    }
    handleMenuClose();
    router.push(`/app/templates/${selectedTemplate.id}/edit`);
  };

  const handleUseTemplate = (template: Template) => {
    router.push(`/app/invoices/new?templateId=${template.id}`);
  };

  const calculateEstimatedTotal = (template: Template) => {
    const subtotal = template.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    let discountAmount = 0;
    if (template.discountType && template.discountValue > 0) {
      discountAmount =
        template.discountType === "PERCENTAGE"
          ? Math.round((subtotal * template.discountValue) / 100)
          : template.discountValue;
    }
    const afterDiscount = Math.max(0, subtotal - discountAmount);
    const taxAmount = template.taxRate ? Math.round((afterDiscount * template.taxRate) / 100) : 0;
    return afterDiscount + taxAmount;
  };

  return (
    <AppLayout>
      <Breadcrumbs items={[{ label: "Templates" }]} />

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" fontWeight={700}>
            Invoice Templates
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Create reusable templates to speed up invoice creation
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push("/app/templates/new")}
        >
          New Template
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load templates. Please try again.
        </Alert>
      )}

      <TemplatesContent
        isLoading={isLoading}
        templates={templates}
        onUseTemplate={handleUseTemplate}
        onMenuOpen={handleMenuOpen}
        onCreateTemplate={() => router.push("/app/templates/new")}
        calculateEstimatedTotal={calculateEstimatedTotal}
      />

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={() => selectedTemplate && handleUseTemplate(selectedTemplate)}>
          <ListItemIcon>
            <ContentCopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Use Template</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      <ConfirmDialog {...dialogProps} />
    </AppLayout>
  );
}

interface TemplatesContentProps {
  isLoading: boolean;
  templates: Template[] | undefined;
  onUseTemplate: (template: Template) => void;
  onMenuOpen: (e: React.MouseEvent<HTMLElement>, id: string) => void;
  onCreateTemplate: () => void;
  calculateEstimatedTotal: (template: Template) => number;
}

function TemplatesContent({
  isLoading,
  templates,
  onUseTemplate,
  onMenuOpen,
  onCreateTemplate,
  calculateEstimatedTotal,
}: TemplatesContentProps) {
  if (isLoading) {
    return (
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <TableSkeleton rows={3} columns={5} />
      </Paper>
    );
  }

  if (templates && templates.length > 0) {
    return (
      <TemplatesTable
        templates={templates}
        onUseTemplate={onUseTemplate}
        onMenuOpen={onMenuOpen}
        calculateEstimatedTotal={calculateEstimatedTotal}
      />
    );
  }

  return (
    <EmptyState
      icon={<DescriptionIcon sx={{ fontSize: 40, color: "primary.main" }} />}
      title="No templates yet"
      description="Create a template to quickly generate invoices with predefined items"
      dashed
      action={
        <Button variant="contained" size="large" startIcon={<AddIcon />} onClick={onCreateTemplate}>
          Create Your First Template
        </Button>
      }
    />
  );
}

interface TemplatesTableProps {
  templates: Template[];
  onUseTemplate: (template: Template) => void;
  onMenuOpen: (e: React.MouseEvent<HTMLElement>, id: string) => void;
  calculateEstimatedTotal: (template: Template) => number;
}

function TemplatesTable({
  templates,
  onUseTemplate,
  onMenuOpen,
  calculateEstimatedTotal,
}: TemplatesTableProps) {
  const theme = useTheme();

  return (
    <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
      <TableContainer>
        <Table>
          <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Items</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Est. Total</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Due Days</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Updated</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {templates.map((template) => (
              <TableRow
                key={template.id}
                hover
                sx={{ cursor: "pointer" }}
                onClick={() => onUseTemplate(template)}
              >
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
                <TableCell>
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
                <TableCell>
                  <Chip label={`${template.dueDays} days`} size="small" variant="outlined" />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {formatDateCompact(template.updatedAt)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
