"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Alert,
  alpha,
  useTheme,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import EditIcon from "@mui/icons-material/Edit";
import DownloadIcon from "@mui/icons-material/Download";
import { AppLayout } from "@app/components/layout/AppLayout";
import { Breadcrumbs } from "@app/components/navigation/Breadcrumbs";
import { TableSkeleton } from "@app/components/feedback/Loading";
import { useToast } from "@app/components/feedback/Toast";
import { ConfirmDialog, useConfirmDialog } from "@app/components/feedback/ConfirmDialog";
import {
  useInvoices,
  useDeleteInvoice,
  useDuplicateInvoice,
  usePrefetchInvoice,
  ApiError,
} from "@app/lib/api";
import { exportInvoicesToCSV } from "@app/lib/export";
import { useVirtualList } from "@app/hooks";

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount / 100);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

const statusConfig: Record<
  string,
  { color: "success" | "error" | "info" | "warning" | "default"; label: string }
> = {
  PAID: { color: "success", label: "Paid" },
  OVERDUE: { color: "error", label: "Overdue" },
  SENT: { color: "info", label: "Sent" },
  VIEWED: { color: "info", label: "Viewed" },
  DRAFT: { color: "default", label: "Draft" },
};

export default function InvoicesPage() {
  const router = useRouter();
  const theme = useTheme();
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

  // Filter and sort invoices
  const filteredInvoices = React.useMemo(() => {
    if (!invoices) return [];

    // First filter
    const filtered = invoices.filter((invoice) => {
      const matchesSearch =
        searchQuery === "" ||
        invoice.publicId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.client.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || invoice.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    // Then sort
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

  // Reset page when filters change
  React.useEffect(() => {
    setPage(0);
  }, [searchQuery, statusFilter]);

  // Paginated invoices (when not showing all)
  const paginatedInvoices = React.useMemo(() => {
    if (showAll) return filteredInvoices;
    const start = page * rowsPerPage;
    return filteredInvoices.slice(start, start + rowsPerPage);
  }, [filteredInvoices, page, rowsPerPage, showAll]);

  // Virtualization for "Show All" mode
  const { parentRef, virtualItems, totalSize } = useVirtualList({
    items: filteredInvoices,
    estimateSize: 65, // Approximate row height
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

  const sortableHeaderSx = {
    fontWeight: 600,
    cursor: "pointer",
    userSelect: "none",
    "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.08) },
  };

  const renderSortIcon = (column: string) =>
    sortColumn === column &&
    (sortDirection === "asc" ? (
      <ArrowUpwardIcon sx={{ fontSize: 16 }} />
    ) : (
      <ArrowDownwardIcon sx={{ fontSize: 16 }} />
    ));

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
    if (!selectedInvoice) return;
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
    if (!selectedInvoice) return;
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
    if (!selectedInvoice) return;
    handleMenuClose();
    router.push(`/app/invoices/${selectedInvoice.id}`);
  };

  const handleEdit = () => {
    if (!selectedInvoice) return;
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

      {/* Search and Filter */}
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

      {isLoading ? (
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <TableSkeleton rows={5} columns={6} />
        </Paper>
      ) : invoices && invoices.length > 0 && filteredInvoices.length > 0 ? (
        <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
          <TableContainer
            ref={showAll ? parentRef : undefined}
            sx={{
              maxHeight: showAll ? 600 : undefined,
              "& .MuiTableHead-root": {
                bgcolor: alpha(theme.palette.primary.main, 0.04),
              },
            }}
          >
            <Table stickyHeader={showAll}>
              <TableHead>
                <TableRow>
                  <TableCell sx={sortableHeaderSx} onClick={() => handleSort("publicId")}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      Invoice # {renderSortIcon("publicId")}
                    </Box>
                  </TableCell>
                  <TableCell sx={sortableHeaderSx} onClick={() => handleSort("client")}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      Client {renderSortIcon("client")}
                    </Box>
                  </TableCell>
                  <TableCell sx={sortableHeaderSx} onClick={() => handleSort("total")}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      Amount {renderSortIcon("total")}
                    </Box>
                  </TableCell>
                  <TableCell sx={sortableHeaderSx} onClick={() => handleSort("dueDate")}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      Due Date {renderSortIcon("dueDate")}
                    </Box>
                  </TableCell>
                  <TableCell sx={sortableHeaderSx} onClick={() => handleSort("status")}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      Status {renderSortIcon("status")}
                    </Box>
                  </TableCell>
                  <TableCell sx={sortableHeaderSx} onClick={() => handleSort("createdAt")}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      Created {renderSortIcon("createdAt")}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, width: 48 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {showAll ? (
                  <>
                    {virtualItems.length > 0 && (
                      <TableRow style={{ height: virtualItems[0].start }}>
                        <TableCell colSpan={7} sx={{ p: 0, border: 0 }} />
                      </TableRow>
                    )}
                    {virtualItems.map((virtualRow) => {
                      const invoice = filteredInvoices[virtualRow.index];
                      const status = statusConfig[invoice.status] || statusConfig.DRAFT;
                      return (
                        <TableRow
                          key={invoice.id}
                          data-index={virtualRow.index}
                          hover
                          sx={{
                            cursor: "pointer",
                            transition: "background-color 0.2s",
                            height: 65,
                            "&:hover": {
                              bgcolor: alpha(theme.palette.primary.main, 0.04),
                            },
                          }}
                          onMouseEnter={() => prefetchInvoice(invoice.id)}
                          onClick={() => router.push(`/app/invoices/${invoice.id}`)}
                        >
                          <TableCell>
                            <Typography variant="body2" fontWeight={600} color="primary.main">
                              {invoice.publicId}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {invoice.client.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {invoice.client.email}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {formatCurrency(invoice.total, invoice.currency)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(invoice.dueDate)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={status.label}
                              size="small"
                              color={status.color}
                              sx={{ fontWeight: 500 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(invoice.createdAt)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={(e) => handleMenuOpen(e, invoice.id)}
                              sx={{ color: "text.secondary" }}
                              aria-label={`Actions for invoice ${invoice.publicId}`}
                            >
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {virtualItems.length > 0 && (
                      <TableRow
                        style={{
                          height: totalSize - (virtualItems[virtualItems.length - 1].end || 0),
                        }}
                      >
                        <TableCell colSpan={7} sx={{ p: 0, border: 0 }} />
                      </TableRow>
                    )}
                  </>
                ) : (
                  paginatedInvoices.map((invoice) => {
                    const status = statusConfig[invoice.status] || statusConfig.DRAFT;
                    return (
                      <TableRow
                        key={invoice.id}
                        hover
                        sx={{
                          cursor: "pointer",
                          transition: "background-color 0.2s",
                          "&:hover": {
                            bgcolor: alpha(theme.palette.primary.main, 0.04),
                          },
                        }}
                        onMouseEnter={() => prefetchInvoice(invoice.id)}
                        onClick={() => router.push(`/app/invoices/${invoice.id}`)}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight={600} color="primary.main">
                            {invoice.publicId}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {invoice.client.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {invoice.client.email}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {formatCurrency(invoice.total, invoice.currency)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(invoice.dueDate)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={status.label}
                            size="small"
                            color={status.color}
                            sx={{ fontWeight: 500 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(invoice.createdAt)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, invoice.id)}
                            sx={{ color: "text.secondary" }}
                            aria-label={`Actions for invoice ${invoice.publicId}`}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
            {showAll ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  px: 2,
                  py: 1,
                  borderTop: 1,
                  borderColor: "divider",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Showing all {filteredInvoices.length} invoices
                </Typography>
                <Button size="small" onClick={() => setShowAll(false)}>
                  Use Pagination
                </Button>
              </Box>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderTop: 1,
                  borderColor: "divider",
                }}
              >
                <TablePagination
                  component="div"
                  count={filteredInvoices.length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  sx={{ flex: 1 }}
                />
                {filteredInvoices.length > 50 && (
                  <Button size="small" onClick={() => setShowAll(true)} sx={{ mr: 2 }}>
                    Show All
                  </Button>
                )}
              </Box>
            )}
          </TableContainer>
        </Paper>
      ) : invoices && invoices.length > 0 && filteredInvoices.length === 0 ? (
        <Paper
          sx={{
            p: 6,
            textAlign: "center",
            borderRadius: 3,
            bgcolor: alpha(theme.palette.primary.main, 0.02),
          }}
        >
          <SearchIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" fontWeight={600} gutterBottom>
            No invoices found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Try adjusting your search or filter to find what you&apos;re looking for.
          </Typography>
          <Button
            variant="outlined"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("ALL");
            }}
          >
            Clear Filters
          </Button>
        </Paper>
      ) : (
        <Paper
          sx={{
            p: 8,
            textAlign: "center",
            borderRadius: 3,
            bgcolor: alpha(theme.palette.primary.main, 0.02),
            border: `2px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3,
            }}
          >
            <ReceiptLongIcon sx={{ fontSize: 40, color: "primary.main" }} />
          </Box>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            No invoices yet
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3, maxWidth: 400, mx: "auto" }}
          >
            Create your first invoice and start getting paid faster. Track payments, send reminders,
            and manage your cash flow all in one place.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => router.push("/app/invoices/new")}
          >
            Create Your First Invoice
          </Button>
        </Paper>
      )}

      {/* Actions Menu */}
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog {...dialogProps} />
    </AppLayout>
  );
}
