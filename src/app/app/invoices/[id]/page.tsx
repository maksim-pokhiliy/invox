"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  alpha,
  useTheme,
  Grid,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import LinkIcon from "@mui/icons-material/Link";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PaymentIcon from "@mui/icons-material/Payment";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EditIcon from "@mui/icons-material/Edit";
import PreviewIcon from "@mui/icons-material/Preview";
import { AppLayout } from "@app/components/layout/AppLayout";
import { Breadcrumbs } from "@app/components/navigation/Breadcrumbs";
import { PageLoader, Spinner } from "@app/components/feedback/Loading";
import { useToast } from "@app/components/feedback/Toast";
import { ConfirmDialog, useConfirmDialog } from "@app/components/feedback/ConfirmDialog";
import {
  useInvoice,
  useSendInvoice,
  useMarkInvoicePaid,
  useDeleteInvoice,
  useDuplicateInvoice,
  ApiError,
} from "@app/lib/api";

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount / 100);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
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

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;
  const theme = useTheme();
  const toast = useToast();
  const { confirm, dialogProps } = useConfirmDialog();
  const [sendDialogOpen, setSendDialogOpen] = React.useState(false);
  const [markPaidDialogOpen, setMarkPaidDialogOpen] = React.useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = React.useState(false);

  const { data: invoice, isLoading, error } = useInvoice(invoiceId);

  const sendMutation = useSendInvoice();
  const markPaidMutation = useMarkInvoicePaid();
  const deleteMutation = useDeleteInvoice();
  const duplicateMutation = useDuplicateInvoice();

  const handleSendInvoice = () => {
    sendMutation.mutate(invoiceId, {
      onSuccess: () => {
        setSendDialogOpen(false);
        toast.success("Invoice sent successfully!", "Email Sent");
      },
      onError: (err) => {
        toast.error(err instanceof ApiError ? err.message : "Failed to send invoice");
      },
    });
  };

  const handleMarkPaid = () => {
    markPaidMutation.mutate(invoiceId, {
      onSuccess: () => {
        setMarkPaidDialogOpen(false);
        toast.success("Invoice marked as paid!", "Payment Recorded");
      },
      onError: (err) => {
        toast.error(err instanceof ApiError ? err.message : "Failed to mark as paid");
      },
    });
  };

  const copyPublicLink = () => {
    const url = `${window.location.origin}/i/${invoice?.publicId}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  const handleDelete = () => {
    confirm({
      title: "Delete Invoice",
      message: `Are you sure you want to delete invoice #${invoice?.publicId}? This action cannot be undone.`,
      confirmText: "Delete",
      confirmColor: "error",
      onConfirm: async () => {
        await deleteMutation.mutateAsync(invoiceId);
        toast.success("Invoice deleted successfully");
        router.push("/app/invoices");
      },
    });
  };

  const handleDuplicate = () => {
    duplicateMutation.mutate(invoiceId, {
      onSuccess: (newInvoice) => {
        toast.success("Invoice duplicated successfully");
        router.push(`/app/invoices/${newInvoice.id}`);
      },
      onError: (err) => {
        toast.error(err instanceof ApiError ? err.message : "Failed to duplicate invoice");
      },
    });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <PageLoader message="Loading invoice..." />
      </AppLayout>
    );
  }

  if (error || !invoice) {
    return (
      <AppLayout>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          Failed to load invoice. Please try again.
        </Alert>
      </AppLayout>
    );
  }

  const isDraft = invoice.status === "DRAFT";
  const isPaid = invoice.status === "PAID";
  const isOverdue = invoice.status === "OVERDUE";
  const status = statusConfig[invoice.status] || statusConfig.DRAFT;

  return (
    <AppLayout>
      <Breadcrumbs
        items={[{ label: "Invoices", href: "/app/invoices" }, { label: `#${invoice.publicId}` }]}
      />

      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 0.5 }}>
            <Typography variant="h4" component="h1" fontWeight={700}>
              Invoice #{invoice.publicId}
            </Typography>
            <Chip label={status.label} color={status.color} sx={{ fontWeight: 600 }} />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Created on {formatDate(invoice.createdAt)}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          {isDraft && (
            <>
              <Button
                variant="contained"
                startIcon={<SendIcon />}
                onClick={() => setSendDialogOpen(true)}
              >
                Send Invoice
              </Button>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => router.push(`/app/invoices/${invoiceId}/edit`)}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                startIcon={<PreviewIcon />}
                onClick={() => setPreviewDialogOpen(true)}
              >
                Preview
              </Button>
            </>
          )}
          {!isDraft && (
            <Button variant="outlined" startIcon={<LinkIcon />} onClick={copyPublicLink}>
              Copy Link
            </Button>
          )}
          {!isPaid && (
            <Button
              variant="outlined"
              startIcon={<CheckCircleIcon />}
              onClick={() => setMarkPaidDialogOpen(true)}
            >
              Mark Paid
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={duplicateMutation.isPending ? <Spinner size={16} /> : <ContentCopyIcon />}
            onClick={handleDuplicate}
            disabled={duplicateMutation.isPending}
          >
            Duplicate
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </Box>
      </Box>

      {/* Timeline */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          bgcolor: alpha(theme.palette.primary.main, 0.02),
        }}
      >
        <Grid container spacing={3}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              <AccessTimeIcon sx={{ fontSize: 18, color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                DUE DATE
              </Typography>
            </Box>
            <Typography
              variant="body1"
              fontWeight={600}
              color={isOverdue ? "error.main" : "text.primary"}
            >
              {formatDate(invoice.dueDate)}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              <SendIcon
                sx={{ fontSize: 18, color: invoice.sentAt ? "success.main" : "text.disabled" }}
              />
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                SENT
              </Typography>
            </Box>
            <Typography
              variant="body1"
              fontWeight={500}
              color={invoice.sentAt ? "text.primary" : "text.disabled"}
            >
              {invoice.sentAt ? formatDateTime(invoice.sentAt) : "Not sent"}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              <VisibilityIcon
                sx={{ fontSize: 18, color: invoice.viewedAt ? "info.main" : "text.disabled" }}
              />
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                VIEWED
              </Typography>
            </Box>
            <Typography
              variant="body1"
              fontWeight={500}
              color={invoice.viewedAt ? "text.primary" : "text.disabled"}
            >
              {invoice.viewedAt ? formatDateTime(invoice.viewedAt) : "Not viewed"}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              <PaymentIcon
                sx={{ fontSize: 18, color: invoice.paidAt ? "success.main" : "text.disabled" }}
              />
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                PAID
              </Typography>
            </Box>
            <Typography
              variant="body1"
              fontWeight={500}
              color={invoice.paidAt ? "success.main" : "text.disabled"}
            >
              {invoice.paidAt ? formatDateTime(invoice.paidAt) : "Unpaid"}
            </Typography>
            {invoice.paymentMethod && (
              <Typography variant="caption" color="text.secondary">
                via {invoice.paymentMethod}
              </Typography>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* Main Content */}
      <Paper sx={{ p: 4, mb: 3, borderRadius: 3 }}>
        {/* Client Info */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="overline" color="text.secondary" sx={{ mb: 1, display: "block" }}>
            Bill To
          </Typography>
          <Typography variant="h6" fontWeight={600}>
            {invoice.client.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {invoice.client.email}
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Line Items */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, border: 0 }}>Description</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, border: 0 }}>
                  Qty
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, border: 0 }}>
                  Unit Price
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, border: 0 }}>
                  Amount
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoice.items.map((item) => (
                <TableRow key={item.id} sx={{ "&:last-child td": { border: 0 } }}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">
                    {formatCurrency(item.unitPrice, invoice.currency)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 500 }}>
                    {formatCurrency(item.amount, invoice.currency)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Divider sx={{ my: 3 }} />

        {/* Totals */}
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Box sx={{ minWidth: 280 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
              <Typography color="text.secondary">Subtotal</Typography>
              <Typography>{formatCurrency(invoice.subtotal, invoice.currency)}</Typography>
            </Box>
            <Divider sx={{ my: 1.5 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="h6" fontWeight={600}>
                Total
              </Typography>
              <Typography variant="h5" fontWeight={700} color="primary.main">
                {formatCurrency(invoice.total, invoice.currency)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* View Public Page */}
      {!isDraft && (
        <Box sx={{ textAlign: "center" }}>
          <Button
            variant="text"
            endIcon={<OpenInNewIcon />}
            onClick={() => window.open(`/i/${invoice.publicId}`, "_blank")}
          >
            View Public Invoice Page
          </Button>
        </Box>
      )}

      {/* Send Dialog */}
      <Dialog
        open={sendDialogOpen}
        onClose={() => setSendDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Send Invoice</DialogTitle>
        <DialogContent>
          <DialogContentText>
            An email will be sent to <strong>{invoice.client.email}</strong> with a link to view and
            pay this invoice.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setSendDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSendInvoice}
            disabled={sendMutation.isPending}
            startIcon={sendMutation.isPending ? <Spinner size={16} /> : <SendIcon />}
          >
            Send Invoice
          </Button>
        </DialogActions>
      </Dialog>

      {/* Mark Paid Dialog */}
      <Dialog
        open={markPaidDialogOpen}
        onClose={() => setMarkPaidDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Mark as Paid</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will mark the invoice as paid manually. Use this if you received payment outside of
            the Stripe integration.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setMarkPaidDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleMarkPaid}
            disabled={markPaidMutation.isPending}
            startIcon={markPaidMutation.isPending ? <Spinner size={16} /> : <CheckCircleIcon />}
          >
            Mark as Paid
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog {...dialogProps} />

      {/* Preview Dialog */}
      <Dialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600, display: "flex", justifyContent: "space-between" }}>
          Invoice Preview
          <Chip label="Preview Mode" size="small" color="info" />
        </DialogTitle>
        <DialogContent>
          <Paper
            variant="outlined"
            sx={{
              p: 4,
              bgcolor: alpha(theme.palette.background.paper, 0.5),
              borderRadius: 2,
            }}
          >
            {/* Invoice Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
              <Box>
                <Typography variant="h4" fontWeight={700}>
                  Invoice
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  #{invoice.publicId}
                </Typography>
              </Box>
              <Chip label="Draft" color="default" />
            </Box>

            {/* From/To */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 4,
                mb: 4,
                p: 3,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.02),
              }}
            >
              <Box>
                <Typography variant="overline" color="text.secondary" fontWeight={600}>
                  From
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Your business info will appear here
                </Typography>
              </Box>
              <Box>
                <Typography variant="overline" color="text.secondary" fontWeight={600}>
                  Bill To
                </Typography>
                <Typography variant="h6" fontWeight={600} sx={{ mt: 1 }}>
                  {invoice.client.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {invoice.client.email}
                </Typography>
              </Box>
            </Box>

            {/* Dates */}
            <Box sx={{ display: "flex", gap: 4, mb: 4 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  INVOICE DATE
                </Typography>
                <Typography variant="body1" fontWeight={500} sx={{ mt: 0.5 }}>
                  {formatDate(invoice.createdAt)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  DUE DATE
                </Typography>
                <Typography variant="body1" fontWeight={500} sx={{ mt: 0.5 }}>
                  {formatDate(invoice.dueDate)}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Items */}
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Qty
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Unit Price
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Amount
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoice.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">
                        {formatCurrency(item.unitPrice, invoice.currency)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 500 }}>
                        {formatCurrency(item.amount, invoice.currency)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Divider sx={{ my: 3 }} />

            {/* Totals */}
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Box sx={{ minWidth: 250 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography color="text.secondary">Subtotal</Typography>
                  <Typography>{formatCurrency(invoice.subtotal, invoice.currency)}</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="h6" fontWeight={600}>
                    Total
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="primary.main">
                    {formatCurrency(invoice.total, invoice.currency)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>

          <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
            This is how your invoice will appear to your client. Once sent, they will receive an
            email with a link to view and pay this invoice.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              setPreviewDialogOpen(false);
              setSendDialogOpen(true);
            }}
            startIcon={<SendIcon />}
          >
            Send Invoice
          </Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
}
