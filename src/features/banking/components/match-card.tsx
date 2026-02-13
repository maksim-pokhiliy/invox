"use client";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";

import { formatCurrency, formatDateCompact } from "@app/shared/lib/format";

import type { BankTransactionData } from "../api";
import { getConfidenceLevel, MATCH_CONFIDENCE_CONFIG } from "../constants";

interface MatchCardProps {
  transaction: BankTransactionData;
  onConfirm: (transactionId: string, invoiceId: string) => void;
  onIgnore: (transactionId: string) => void;
  confirmingId: string | null;
  ignoringId: string | null;
}

export function MatchCard({
  transaction,
  onConfirm,
  onIgnore,
  confirmingId,
  ignoringId,
}: MatchCardProps) {
  const theme = useTheme();
  const confidence = transaction.matchConfidence ?? 0;
  const confidenceLevel = getConfidenceLevel(confidence);
  const confidenceConfig = MATCH_CONFIDENCE_CONFIG[confidenceLevel];
  const invoice = transaction.matchedInvoice;

  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: "center", mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              {formatCurrency(transaction.amount, transaction.currencyCode)}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {transaction.description}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDateCompact(transaction.madeOn)} &middot;{" "}
              {transaction.account.connection.providerName}
            </Typography>
          </Box>

          <ArrowForwardIcon sx={{ color: "text.disabled" }} />

          <Box sx={{ flex: 1 }}>
            {invoice ? (
              <>
                <Typography variant="subtitle2" fontWeight={600}>
                  {formatCurrency(invoice.total, invoice.currency)}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {invoice.client.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  #{invoice.publicId}
                  {invoice.paymentReference && ` \u00B7 ${invoice.paymentReference}`}
                </Typography>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No match suggested
              </Typography>
            )}
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
          <Chip
            label={`${Math.round(confidence * 100)}% \u00B7 ${confidenceConfig.label}`}
            color={confidenceConfig.color}
            size="small"
            sx={{
              fontWeight: 500,
              bgcolor: alpha(theme.palette[confidenceConfig.color].main, 0.1),
              color: `${confidenceConfig.color}.dark`,
            }}
          />

          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              startIcon={<CancelOutlinedIcon />}
              onClick={() => onIgnore(transaction.id)}
              disabled={ignoringId === transaction.id || confirmingId === transaction.id}
            >
              Ignore
            </Button>
            {invoice && (
              <Button
                size="small"
                variant="contained"
                startIcon={<CheckCircleOutlineIcon />}
                onClick={() => onConfirm(transaction.id, invoice.id)}
                disabled={confirmingId === transaction.id || ignoringId === transaction.id}
              >
                Confirm
              </Button>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
