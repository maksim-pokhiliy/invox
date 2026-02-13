"use client";

import { useRouter } from "next/navigation";

import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditIcon from "@mui/icons-material/Edit";
import LinkIcon from "@mui/icons-material/Link";
import PreviewIcon from "@mui/icons-material/Preview";
import SendIcon from "@mui/icons-material/Send";
import { Box, Button, Chip, type ChipProps, Stack, Typography } from "@mui/material";

import { RESPONSIVE_SX } from "@app/shared/config/config";
import { formatDate } from "@app/shared/lib/format";
import type { Invoice } from "@app/shared/schemas/api";
import { Breadcrumbs } from "@app/shared/ui/breadcrumbs";

import { InvoiceOverflowMenu } from "../components/invoice-overflow-menu";
import { useInvoiceDetail } from "../hooks/use-invoice-detail";

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
    <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
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
            sx={RESPONSIVE_SX.DESKTOP_ONLY}
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
          sx={RESPONSIVE_SX.DESKTOP_MD_ONLY}
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
    </Stack>
  );
}

interface DetailHeaderProps {
  invoice: Invoice;
  status: { label: string; color: NonNullable<ChipProps["color"]> };
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

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          mb: 4,
        }}
      >
        <Box>
          <Stack direction="row" spacing={2} sx={{ alignItems: "center", mb: 0.5 }}>
            <Typography variant="h4" component="h1" fontWeight={700}>
              Invoice #{invoice.publicId}
            </Typography>
            <Chip label={status.label} color={status.color} sx={{ fontWeight: 600 }} />
          </Stack>
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
      </Stack>
    </>
  );
}
