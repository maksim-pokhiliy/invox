"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  alpha,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import ReceiptIcon from "@mui/icons-material/Receipt";
import RepeatIcon from "@mui/icons-material/Repeat";
import { AppLayout } from "@app/shared/layout/app-layout";
import { Breadcrumbs } from "@app/shared/ui/breadcrumbs";
import { EmptyState } from "@app/shared/ui/empty-state";
import { TableSkeleton } from "@app/shared/ui/loading";
import { useToast } from "@app/shared/ui/toast";
import { ConfirmDialog } from "@app/shared/ui/confirm-dialog";
import {
  useRecurringInvoices,
  useDeleteRecurring,
  useUpdateRecurring,
  useGenerateFromRecurring,
  type RecurringInvoice,
  type RecurringStatus,
} from "@app/features/recurring";
import { ApiError } from "@app/shared/api";
import { formatCurrency, formatDateCompact } from "@app/shared/lib/format";

const frequencyLabels: Record<string, string> = {
  WEEKLY: "Weekly",
  BIWEEKLY: "Bi-weekly",
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  YEARLY: "Yearly",
};

const statusConfig: Record<
  RecurringStatus,
  { color: "success" | "warning" | "error"; label: string }
> = {
  ACTIVE: { color: "success", label: "Active" },
  PAUSED: { color: "warning", label: "Paused" },
  CANCELED: { color: "error", label: "Canceled" },
};

export default function RecurringInvoicesPage() {
  const router = useRouter();
  const toast = useToast();
  const { data: recurring, isLoading } = useRecurringInvoices();
  const deleteMutation = useDeleteRecurring();
  const updateMutation = useUpdateRecurring();
  const generateMutation = useGenerateFromRecurring();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = React.useState<RecurringInvoice | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, item: RecurringInvoice) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleToggleStatus = () => {
    if (!selectedItem) {
      return;
    }
    const newStatus: RecurringStatus = selectedItem.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
    updateMutation.mutate(
      { id: selectedItem.id, data: { status: newStatus } },
      {
        onSuccess: () => {
          toast.success(`Recurring invoice ${newStatus === "ACTIVE" ? "activated" : "paused"}`);
        },
        onError: (err) => {
          toast.error(err instanceof ApiError ? err.message : "Failed to update status");
        },
      }
    );
    handleMenuClose();
  };

  const handleGenerateNow = () => {
    if (!selectedItem) {
      return;
    }
    generateMutation.mutate(selectedItem.id, {
      onSuccess: (data) => {
        toast.success("Invoice generated successfully");
        router.push(`/app/invoices/${data.invoiceId}`);
      },
      onError: (err) => {
        toast.error(err instanceof ApiError ? err.message : "Failed to generate invoice");
      },
    });
    handleMenuClose();
  };

  const handleDelete = () => {
    if (!selectedItem) {
      return;
    }
    deleteMutation.mutate(selectedItem.id, {
      onSuccess: () => {
        toast.success("Recurring invoice deleted");
        setDeleteDialogOpen(false);
        setSelectedItem(null);
      },
      onError: (err) => {
        toast.error(err instanceof ApiError ? err.message : "Failed to delete");
      },
    });
  };

  const calculateTotal = (item: RecurringInvoice) => {
    const subtotal = item.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
    let discount = 0;
    if (item.discountType === "PERCENTAGE") {
      discount = Math.round((subtotal * item.discountValue) / 100);
    } else if (item.discountType === "FIXED") {
      discount = item.discountValue;
    }
    const afterDiscount = subtotal - discount;
    const tax = Math.round((afterDiscount * item.taxRate) / 100);
    return afterDiscount + tax;
  };

  return (
    <AppLayout>
      <Breadcrumbs items={[{ label: "Recurring Invoices" }]} />

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight={700}>
            Recurring Invoices
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage automatic invoice generation schedules
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push("/app/recurring/new")}
        >
          New Recurring Invoice
        </Button>
      </Box>

      <RecurringContent
        isLoading={isLoading}
        recurring={recurring}
        router={router}
        handleMenuOpen={handleMenuOpen}
        calculateTotal={calculateTotal}
      />

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => router.push(`/app/recurring/${selectedItem?.id}/edit`)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        {selectedItem?.status !== "CANCELED" && (
          <MenuItem onClick={handleToggleStatus}>
            <ListItemIcon>
              {selectedItem?.status === "ACTIVE" ? (
                <PauseIcon fontSize="small" />
              ) : (
                <PlayArrowIcon fontSize="small" />
              )}
            </ListItemIcon>
            <ListItemText>{selectedItem?.status === "ACTIVE" ? "Pause" : "Activate"}</ListItemText>
          </MenuItem>
        )}
        {selectedItem?.status === "ACTIVE" && (
          <MenuItem onClick={handleGenerateNow}>
            <ListItemIcon>
              <ReceiptIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Generate Now</ListItemText>
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            handleMenuClose();
            setDeleteDialogOpen(true);
          }}
          sx={{ color: "error.main" }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Recurring Invoice"
        message={`Are you sure you want to delete "${selectedItem?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmColor="error"
        onConfirm={handleDelete}
        onClose={() => setDeleteDialogOpen(false)}
        isLoading={deleteMutation.isPending}
      />
    </AppLayout>
  );
}

function RecurringContent({
  isLoading,
  recurring,
  router,
  handleMenuOpen,
  calculateTotal,
}: {
  isLoading: boolean;
  recurring: RecurringInvoice[] | undefined;
  router: ReturnType<typeof useRouter>;
  handleMenuOpen: (event: React.MouseEvent<HTMLElement>, item: RecurringInvoice) => void;
  calculateTotal: (item: RecurringInvoice) => number;
}) {
  const theme = useTheme();
  if (isLoading) {
    return (
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <TableSkeleton rows={5} columns={7} />
      </Paper>
    );
  }

  if (recurring && recurring.length > 0) {
    return (
      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
              <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Client</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Frequency</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Next Run</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recurring.map((item) => (
              <TableRow
                key={item.id}
                hover
                sx={{ "&:last-child td": { border: 0 }, cursor: "pointer" }}
                onClick={() => router.push(`/app/recurring/${item.id}`)}
              >
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 1.5,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <RepeatIcon sx={{ fontSize: 18, color: "primary.main" }} />
                    </Box>
                    <Typography fontWeight={500}>{item.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{item.client.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.client.email}
                  </Typography>
                </TableCell>
                <TableCell>{frequencyLabels[item.frequency]}</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>
                  {formatCurrency(calculateTotal(item), item.currency)}
                </TableCell>
                <TableCell>{formatDateCompact(item.nextRunAt)}</TableCell>
                <TableCell>
                  <Chip
                    label={statusConfig[item.status].label}
                    color={statusConfig[item.status].color}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMenuOpen(e, item);
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <EmptyState
      icon={<RepeatIcon sx={{ fontSize: 40, color: "primary.main" }} />}
      title="No recurring invoices yet"
      description="Set up automatic invoice generation for regular clients"
      action={
        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          onClick={() => router.push("/app/recurring/new")}
        >
          Create Recurring Invoice
        </Button>
      }
    />
  );
}
