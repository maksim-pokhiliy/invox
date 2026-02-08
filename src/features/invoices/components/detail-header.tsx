"use client";

import { useRouter } from "next/navigation";
import { Box, Button, Chip, Typography } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import LinkIcon from "@mui/icons-material/Link";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditIcon from "@mui/icons-material/Edit";
import PreviewIcon from "@mui/icons-material/Preview";
import AddIcon from "@mui/icons-material/Add";
import { Breadcrumbs } from "@app/shared/ui/breadcrumbs";
import { formatDate } from "@app/shared/lib/format";
import type { Invoice } from "@app/shared/schemas/api";
import { InvoiceOverflowMenu } from "@app/features/invoices/components";
import { useInvoiceDetail } from "./use-invoice-detail";

type InvoiceDetailReturn = ReturnType<typeof useInvoiceDetail>;

interface DetailActionsProps {
  isDraft: boolean;
  isPaid: boolean;
  isPartiallyPaid: boolean;
  invoiceId: string;
  detail: InvoiceDetailReturn;
}

export function DetailActions({
  isDraft,
  isPaid,
  isPartiallyPaid,
  invoiceId,
  detail,
}: DetailActionsProps) {
  const router = useRouter();

  return (
    <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
      {isDraft && (
        <>
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={() => detail.setSendDialogOpen(true)}
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
            onClick={() => detail.setPreviewDialogOpen(true)}
            sx={{ display: { xs: "none", sm: "flex" } }}
          >
            Preview
          </Button>
        </>
      )}
      {!isDraft && (
        <Button variant="outlined" startIcon={<LinkIcon />} onClick={detail.copyPublicLink}>
          Copy Link
        </Button>
      )}
      {!isPaid && !isDraft && (
        <Button
          variant="outlined"
          color="success"
          startIcon={<AddIcon />}
          onClick={() => detail.setPaymentDialogOpen(true)}
        >
          Record Payment
        </Button>
      )}
      {!isPaid && !isPartiallyPaid && (
        <Button
          variant="outlined"
          startIcon={<CheckCircleIcon />}
          onClick={() => detail.setMarkPaidDialogOpen(true)}
          sx={{ display: { xs: "none", md: "flex" } }}
        >
          Mark Paid
        </Button>
      )}
      <InvoiceOverflowMenu
        isDraft={isDraft}
        isPaid={isPaid}
        isPartiallyPaid={isPartiallyPaid}
        isDuplicating={detail.duplicateMutation.isPending}
        onPreview={() => detail.setPreviewDialogOpen(true)}
        onMarkPaid={() => detail.setMarkPaidDialogOpen(true)}
        onDownloadPdf={detail.handleDownloadPdf}
        onDuplicate={detail.handleDuplicate}
        onDelete={detail.handleDelete}
      />
    </Box>
  );
}

interface DetailHeaderProps {
  invoice: Invoice;
  status: { label: string; color: "success" | "error" | "info" | "warning" | "default" };
  isDraft: boolean;
  isPaid: boolean;
  isPartiallyPaid: boolean;
  invoiceId: string;
  detail: InvoiceDetailReturn;
}

export function DetailHeader({
  invoice,
  status,
  isDraft,
  isPaid,
  isPartiallyPaid,
  invoiceId,
  detail,
}: DetailHeaderProps) {
  return (
    <>
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

        <DetailActions
          isDraft={isDraft}
          isPaid={isPaid}
          isPartiallyPaid={isPartiallyPaid}
          invoiceId={invoiceId}
          detail={detail}
        />
      </Box>
    </>
  );
}
