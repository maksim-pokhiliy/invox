"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Typography,
  Alert,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import EditIcon from "@mui/icons-material/Edit";
import DownloadIcon from "@mui/icons-material/Download";
import { AppLayout } from "@app/shared/layout/app-layout";
import { Breadcrumbs } from "@app/shared/ui/breadcrumbs";
import { useToast } from "@app/shared/ui/toast";
import { ConfirmDialog, useConfirmDialog } from "@app/shared/ui/confirm-dialog";
import { InvoicesContent } from "@app/features/invoices/components";
import {
  useInvoices,
  useDeleteInvoice,
  useDuplicateInvoice,
  usePrefetchInvoice,
} from "@app/features/invoices";
import { ApiError } from "@app/shared/api";
import { exportInvoicesToCSV } from "@app/shared/lib/export";
import { useVirtualList } from "@app/shared/hooks";

export default function InvoicesPage() {
  const router = useRouter();
  const toast = useToast();
  const { confirm, dialogProps } = useConfirmDialog();

  const { data: invoices, isLoading, error } = useInvoices();
  const deleteMutation = useDeleteInvoice();
  const duplicateMutation = useDuplicateInvoice();
  const prefetchInvoice = usePrefetchInvoice();

  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [sortColumn, setSortColumn] = React.useState<string>("createdAt");
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("desc");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [showAll, setShowAll] = React.useState(false);

  const selectedInvoice = invoices?.find((inv) => inv.id === selectedInvoiceId);

  const filteredInvoices = React.useMemo(() => {
    if (!invoices) {
      return [];
    }

    const filtered = invoices.filter((invoice) => {
      const matchesSearch =
        searchQuery === "" ||
        invoice.publicId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.client.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || invoice.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    return filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortColumn) {
        case "publicId":
          comparison = a.publicId.localeCompare(b.publicId);
          break;
        case "client":
          comparison = a.client.name.localeCompare(b.client.name);
          break;
        case "total":
          comparison = a.total - b.total;
          break;
        case "dueDate":
          comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "createdAt":
        default:
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [invoices, searchQuery, statusFilter, sortColumn, sortDirection]);

  React.useEffect(() => {
    setPage(0);
  }, [searchQuery, statusFilter]);

  const paginatedInvoices = React.useMemo(() => {
    if (showAll) {
      return filteredInvoices;
    }
    const start = page * rowsPerPage;
    return filteredInvoices.slice(start, start + rowsPerPage);
  }, [filteredInvoices, page, rowsPerPage, showAll]);

  const { parentRef, virtualItems, totalSize } = useVirtualList({
    items: filteredInvoices,
    estimateSize: 65,
    overscan: 10,
  });

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, invoiceId: string) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedInvoiceId(invoiceId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedInvoiceId(null);
  };

  const handleDelete = () => {
    if (!selectedInvoice) {
      return;
    }
    handleMenuClose();
    confirm({
      title: "Delete Invoice",
      message: `Are you sure you want to delete invoice #${selectedInvoice.publicId}? This action cannot be undone.`,
      confirmText: "Delete",
      confirmColor: "error",
      onConfirm: async () => {
        await deleteMutation.mutateAsync(selectedInvoice.id);
        toast.success("Invoice deleted successfully");
      },
    });
  };

  const handleDuplicate = () => {
    if (!selectedInvoice) {
      return;
    }
    handleMenuClose();
    duplicateMutation.mutate(selectedInvoice.id, {
      onSuccess: (newInvoice) => {
        toast.success("Invoice duplicated successfully");
        router.push(`/app/invoices/${newInvoice.id}`);
      },
      onError: (err) => {
        toast.error(err instanceof ApiError ? err.message : "Failed to duplicate invoice");
      },
    });
  };

  const handleViewDetails = () => {
    if (!selectedInvoice) {
      return;
    }
    handleMenuClose();
    router.push(`/app/invoices/${selectedInvoice.id}`);
  };

  const handleEdit = () => {
    if (!selectedInvoice) {
      return;
    }
    handleMenuClose();
    router.push(`/app/invoices/${selectedInvoice.id}/edit`);
  };

  const handleExportCSV = () => {
    if (!filteredInvoices.length) {
      toast.error("No invoices to export");
      return;
    }
    exportInvoicesToCSV(filteredInvoices);
    toast.success(`Exported ${filteredInvoices.length} invoices`);
  };

  return (
    <AppLayout>
      <Breadcrumbs items={[{ label: "Invoices" }]} />

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
            Invoices
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage and track all your invoices
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          {invoices && invoices.length > 0 && (
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportCSV}
              sx={{ display: { xs: "none", sm: "flex" } }}
            >
              Export CSV
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push("/app/invoices/new")}
            sx={{ display: { xs: "none", sm: "flex" } }}
          >
            New Invoice
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load invoices. Please try again.
        </Alert>
      )}

      {!isLoading && invoices && invoices.length > 0 && (
        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 3,
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <TextField
            placeholder="Search invoices..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ minWidth: { sm: 280 } }}
            inputProps={{ "aria-label": "Search invoices" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="ALL">All Statuses</MenuItem>
              <MenuItem value="DRAFT">Draft</MenuItem>
              <MenuItem value="SENT">Sent</MenuItem>
              <MenuItem value="VIEWED">Viewed</MenuItem>
              <MenuItem value="PARTIALLY_PAID">Partially Paid</MenuItem>
              <MenuItem value="PAID">Paid</MenuItem>
              <MenuItem value="OVERDUE">Overdue</MenuItem>
            </Select>
          </FormControl>
          {(searchQuery || statusFilter !== "ALL") && (
            <Typography variant="body2" color="text.secondary" sx={{ alignSelf: "center" }}>
              {filteredInvoices.length} of {invoices.length} invoices
            </Typography>
          )}
        </Box>
      )}

      <InvoicesContent
        isLoading={isLoading}
        invoices={invoices}
        filteredInvoices={filteredInvoices}
        paginatedInvoices={paginatedInvoices}
        showAll={showAll}
        setShowAll={setShowAll}
        virtualItems={virtualItems}
        totalSize={totalSize}
        parentRef={parentRef}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
        onRowClick={(id) => router.push(`/app/invoices/${id}`)}
        onMenuOpen={handleMenuOpen}
        onPrefetch={prefetchInvoice}
        onClearFilters={() => {
          setSearchQuery("");
          setStatusFilter("ALL");
        }}
        onCreateInvoice={() => router.push("/app/invoices/new")}
      />

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: { minWidth: 160, borderRadius: 2 },
          },
        }}
        aria-label="Invoice actions"
      >
        <MenuItem onClick={handleViewDetails}>
          <ListItemIcon>
            <OpenInNewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View</ListItemText>
        </MenuItem>
        {selectedInvoice?.status === "DRAFT" && (
          <MenuItem onClick={handleEdit}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={handleDuplicate}>
          <ListItemIcon>
            <ContentCopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
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
