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
  alpha,
  useTheme,
  LinearProgress,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import LinkIcon from "@mui/icons-material/Link";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EditIcon from "@mui/icons-material/Edit";
import PreviewIcon from "@mui/icons-material/Preview";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import AddIcon from "@mui/icons-material/Add";
import { AppLayout } from "@app/shared/layout/app-layout";
import { Breadcrumbs } from "@app/shared/ui/breadcrumbs";
import { PageLoader, Spinner } from "@app/shared/ui/loading";
import { useToast } from "@app/shared/ui/toast";
import { ConfirmDialog, useConfirmDialog } from "@app/shared/ui/confirm-dialog";
import {
  useInvoice,
  useSendInvoice,
  useMarkInvoicePaid,
  useDeleteInvoice,
  useDuplicateInvoice,
  useRecordPayment,
  useDeletePayment,
} from "@app/features/invoices";
import { ApiError } from "@app/shared/api";
import { generateInvoicePdf } from "@app/shared/lib/export";
import { formatCurrency, formatDate } from "@app/shared/lib/format";
import { STATUS_CONFIG } from "@app/features/invoices/constants/invoice";
import {
  InvoiceTimeline,
  PaymentHistory,
  ActivityHistory,
  SendDialog,
  MarkPaidDialog,
  RecordPaymentDialog,
  InvoicePreviewDialog,
} from "@app/features/invoices/components";

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
  const [auditLogExpanded, setAuditLogExpanded] = React.useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = React.useState(false);
  const [paymentsExpanded, setPaymentsExpanded] = React.useState(true);

  const { data: invoice, isLoading, error } = useInvoice(invoiceId);

  const sendMutation = useSendInvoice();
  const markPaidMutation = useMarkInvoicePaid();
  const deleteMutation = useDeleteInvoice();
  const duplicateMutation = useDuplicateInvoice();
  const recordPaymentMutation = useRecordPayment();
  const deletePaymentMutation = useDeletePayment();

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

  const handleRecordPayment = (amount: string, note: string) => {
    const amountInCents = Math.round(parseFloat(amount) * 100);
    if (isNaN(amountInCents) || amountInCents <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    recordPaymentMutation.mutate(
      {
        invoiceId,
        data: {
          amount: amountInCents,
          method: "MANUAL",
          note: note || undefined,
        },
      },
      {
        onSuccess: () => {
          setPaymentDialogOpen(false);
          toast.success("Payment recorded successfully!");
        },
        onError: (err) => {
          toast.error(err instanceof ApiError ? err.message : "Failed to record payment");
        },
      }
    );
  };

  const handleDeletePayment = (paymentId: string) => {
    confirm({
      title: "Delete Payment",
      message: "Are you sure you want to delete this payment? This action cannot be undone.",
      confirmText: "Delete",
      confirmColor: "error",
      onConfirm: async () => {
        await deletePaymentMutation.mutateAsync({ invoiceId, paymentId });
        toast.success("Payment deleted");
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
  const isPartiallyPaid = invoice.status === "PARTIALLY_PAID";
  const isOverdue = invoice.status === "OVERDUE";
  const status = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.DRAFT;
  const remainingBalance = invoice.total - (invoice.paidAmount || 0);
  const paidPercentage = invoice.total > 0 ? ((invoice.paidAmount || 0) / invoice.total) * 100 : 0;

  return (
    <AppLayout>
      <Breadcrumbs
        items={[{ label: "Invoices", href: "/app/invoices" }, { label: `#${invoice.publicId}` }]}
      />

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
          {!isPaid && !isDraft && (
            <Button
              variant="outlined"
              color="success"
              startIcon={<AddIcon />}
              onClick={() => setPaymentDialogOpen(true)}
            >
              Record Payment
            </Button>
          )}
          {!isPaid && !isPartiallyPaid && (
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
            startIcon={<PictureAsPdfIcon />}
            onClick={() => {
              generateInvoicePdf({
                ...invoice,
                sender: null,
              });
              toast.success("PDF downloaded!");
            }}
          >
            Download PDF
          </Button>
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

      <InvoiceTimeline
        dueDate={invoice.dueDate}
        sentAt={invoice.sentAt}
        viewedAt={invoice.viewedAt}
        paidAt={invoice.paidAt}
        paymentMethod={invoice.paymentMethod}
        isOverdue={isOverdue}
      />

      <Paper sx={{ p: 4, mb: 3, borderRadius: 3 }}>
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

        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Box sx={{ minWidth: 280 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
              <Typography color="text.secondary">Subtotal</Typography>
              <Typography>{formatCurrency(invoice.subtotal, invoice.currency)}</Typography>
            </Box>
            <Divider sx={{ my: 1.5 }} />
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1.5,
              }}
            >
              <Typography variant="h6" fontWeight={600}>
                Total
              </Typography>
              <Typography variant="h5" fontWeight={700} color="primary.main">
                {formatCurrency(invoice.total, invoice.currency)}
              </Typography>
            </Box>
            {(invoice.paidAmount || 0) > 0 && (
              <>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography color="success.main" fontWeight={500}>
                    Paid
                  </Typography>
                  <Typography color="success.main" fontWeight={500}>
                    -{formatCurrency(invoice.paidAmount || 0, invoice.currency)}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={paidPercentage}
                  sx={{
                    height: 6,
                    borderRadius: 1,
                    mb: 1.5,
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    "& .MuiLinearProgress-bar": {
                      bgcolor: "success.main",
                    },
                  }}
                />
                <Box
                  sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <Typography
                    fontWeight={600}
                    color={remainingBalance > 0 ? "error.main" : "success.main"}
                  >
                    {remainingBalance > 0 ? "Balance Due" : "Fully Paid"}
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    color={remainingBalance > 0 ? "error.main" : "success.main"}
                  >
                    {formatCurrency(remainingBalance, invoice.currency)}
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Paper>

      <PaymentHistory
        payments={invoice.payments || []}
        currency={invoice.currency}
        isPaid={isPaid}
        expanded={paymentsExpanded}
        onToggle={() => setPaymentsExpanded(!paymentsExpanded)}
        onDeletePayment={handleDeletePayment}
      />

      {!isDraft && (
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Button
            variant="text"
            endIcon={<OpenInNewIcon />}
            onClick={() => window.open(`/i/${invoice.publicId}`, "_blank")}
          >
            View Public Invoice Page
          </Button>
        </Box>
      )}

      <ActivityHistory
        events={invoice.events || []}
        expanded={auditLogExpanded}
        onToggle={() => setAuditLogExpanded(!auditLogExpanded)}
      />

      <SendDialog
        open={sendDialogOpen}
        onClose={() => setSendDialogOpen(false)}
        onConfirm={handleSendInvoice}
        isLoading={sendMutation.isPending}
        clientEmail={invoice.client.email}
      />

      <MarkPaidDialog
        open={markPaidDialogOpen}
        onClose={() => setMarkPaidDialogOpen(false)}
        onConfirm={handleMarkPaid}
        isLoading={markPaidMutation.isPending}
      />

      <RecordPaymentDialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        onConfirm={handleRecordPayment}
        isLoading={recordPaymentMutation.isPending}
        remainingBalance={remainingBalance}
        currency={invoice.currency}
      />

      <ConfirmDialog {...dialogProps} />

      <InvoicePreviewDialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        onSend={() => {
          setPreviewDialogOpen(false);
          setSendDialogOpen(true);
        }}
        invoice={invoice}
      />
    </AppLayout>
  );
}
