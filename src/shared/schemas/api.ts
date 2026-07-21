import { z } from "zod";

import { DISCOUNT_TYPE, INVOICE_EVENT, INVOICE_STATUS } from "@app/shared/config/invoice-status";
import { PAYMENT_METHOD } from "@app/shared/config/payment-method";
import { asClientId, asInvoiceId, asPaymentId } from "@app/shared/types/ids";
import { asCents } from "@app/shared/types/money";

const nullableCents = (v: number | null) => (v === null ? null : asCents(v));

const invoiceStatusSchema = z.nativeEnum(INVOICE_STATUS);
const invoiceEventTypeSchema = z.nativeEnum(INVOICE_EVENT);
const discountTypeSchema = z.nativeEnum(DISCOUNT_TYPE);
const paymentMethodSchema = z.nativeEnum(PAYMENT_METHOD);

const clientRefSchema = z.object({
  id: z.string().transform(asClientId),
  name: z.string(),
  email: z.string(),
});

const clientBriefSchema = z.object({
  name: z.string(),
  email: z.string(),
});

export const successAckSchema = z.object({
  success: z.boolean(),
});

export const messageAckSchema = z.object({
  message: z.string(),
});

export const clientSchema = z.object({
  id: z.string().transform(asClientId),
  name: z.string(),
  email: z.string(),
  defaultRate: z.number().nullable().transform(nullableCents),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const clientListSchema = z.array(clientSchema);

export const serviceSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  unit: z.string().nullable(),
  defaultPrice: z.number().transform(asCents),
  active: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const serviceListSchema = z.array(serviceSchema);

export const invoiceItemResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  quantity: z.number(),
  unitPrice: z.number().transform(asCents),
  amount: z.number().transform(asCents),
  sortOrder: z.number().optional(),
  serviceId: z.string().nullable().optional(),
});

export const invoiceItemGroupResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  sortOrder: z.number().optional(),
  items: z.array(invoiceItemResponseSchema),
});

export const invoiceEventSchema = z.object({
  id: z.string(),
  type: invoiceEventTypeSchema,
  payload: z.unknown().optional(),
  createdAt: z.string(),
});

export const paymentSchema = z.object({
  id: z.string().transform(asPaymentId),
  invoiceId: z.string().transform(asInvoiceId),
  amount: z.number().transform(asCents),
  method: paymentMethodSchema,
  note: z.string().nullable(),
  paidAt: z.string(),
  createdAt: z.string(),
});

export const paymentListSchema = z.array(paymentSchema);

export const invoiceSchema = z.object({
  id: z.string().transform(asInvoiceId),
  publicId: z.string(),
  status: invoiceStatusSchema,
  currency: z.string(),
  subtotal: z.number().transform(asCents),
  discountType: discountTypeSchema.nullable(),
  discountValue: z.number(),
  discountAmount: z.number().transform(asCents),
  taxRate: z.number(),
  taxAmount: z.number().transform(asCents),
  total: z.number().transform(asCents),
  paidAmount: z.number().transform(asCents),
  dueDate: z.string(),
  periodStart: z.string().nullable(),
  periodEnd: z.string().nullable(),
  notes: z.string().nullable(),
  message: z.string().nullable(),
  tags: z.array(z.string()),
  sentAt: z.string().nullable(),
  viewedAt: z.string().nullable(),
  paidAt: z.string().nullable(),
  paymentMethod: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  client: clientRefSchema,
  items: z.array(invoiceItemResponseSchema),
  itemGroups: z.array(invoiceItemGroupResponseSchema).optional(),
  events: z.array(invoiceEventSchema).optional(),
  payments: z.array(paymentSchema).optional(),
});

export const invoiceListItemSchema = z.object({
  id: z.string().transform(asInvoiceId),
  publicId: z.string(),
  status: invoiceStatusSchema,
  currency: z.string(),
  total: z.number().transform(asCents),
  paidAmount: z.number().transform(asCents),
  dueDate: z.string(),
  tags: z.array(z.string()),
  createdAt: z.string(),
  client: clientBriefSchema,
});

export const invoiceListSchema = z.array(invoiceListItemSchema);

export const senderProfileResponseSchema = z.object({
  id: z.string(),
  companyName: z.string().nullable(),
  displayName: z.string().nullable(),
  emailFrom: z.string().nullable(),
  address: z.string().nullable(),
  taxId: z.string().nullable(),
  defaultCurrency: z.string(),
  logoUrl: z.string().nullable(),
  primaryColor: z.string().nullable(),
  accentColor: z.string().nullable(),
  footerText: z.string().nullable(),
  fontFamily: z.string().nullable(),
  invoicePrefix: z.string().nullable(),
  defaultRate: z.number().nullable().transform(nullableCents),
});

export const monthlyRevenueSchema = z.object({
  month: z.string(),
  revenue: z.number().transform(asCents),
});

export const recentInvoiceSchema = z.object({
  id: z.string().transform(asInvoiceId),
  publicId: z.string(),
  clientName: z.string(),
  total: z.number().transform(asCents),
  currency: z.string(),
  status: z.string(),
  createdAt: z.string(),
});

export const currencyMetricsSchema = z.object({
  totalRevenue: z.number().transform(asCents),
  revenueThisMonth: z.number().transform(asCents),
  revenueLastMonth: z.number().transform(asCents),
  outstandingBalance: z.number().transform(asCents),
  overdueAmount: z.number().transform(asCents),
  monthlyRevenue: z.array(monthlyRevenueSchema),
});

export const analyticsDataSchema = z.object({
  currencies: z.array(z.string()),
  byCurrency: z.record(z.string(), currencyMetricsSchema),
  totalRevenue: z.number().transform(asCents),
  revenueThisMonth: z.number().transform(asCents),
  revenueLastMonth: z.number().transform(asCents),
  outstandingBalance: z.number().transform(asCents),
  overdueAmount: z.number().transform(asCents),
  totalInvoices: z.number(),
  paidInvoices: z.number(),
  overdueInvoices: z.number(),
  statusCounts: z.record(z.string(), z.number()),
  monthlyRevenue: z.array(monthlyRevenueSchema),
  clientCount: z.number(),
  recentInvoices: z.array(recentInvoiceSchema),
});

export type {
  ProviderCapabilities,
  ProviderInfo,
  TimeEntriesResult,
  TimeEntryGroup,
  TimeEntryItem,
  TimeTrackingConnection,
  TimeTrackingProject,
  TimeTrackingWorkspace,
} from "./time-tracking";
export {
  providerCapabilitiesSchema,
  providerInfoListSchema,
  providerInfoSchema,
  timeEntriesResultSchema,
  timeEntryGroupSchema,
  timeEntryItemSchema,
  timeTrackingConnectionListSchema,
  timeTrackingConnectionSchema,
  timeTrackingProjectListSchema,
  timeTrackingProjectSchema,
  timeTrackingWorkspaceListSchema,
  timeTrackingWorkspaceSchema,
} from "./time-tracking";

export const publicInvoiceSchema = z.object({
  publicId: z.string(),
  status: z.string(),
  currency: z.string(),
  subtotal: z.number().transform(asCents),
  total: z.number().transform(asCents),
  dueDate: z.string(),
  periodStart: z.string().nullable(),
  periodEnd: z.string().nullable(),
  paidAt: z.string().nullable(),
  createdAt: z.string(),
  message: z.string().nullable(),
  paymentReference: z.string().nullable(),
  client: clientBriefSchema,
  items: z.array(invoiceItemResponseSchema),
  itemGroups: z.array(invoiceItemGroupResponseSchema),
  sender: z.object({
    name: z.string(),
    address: z.string(),
    taxId: z.string(),
  }),
});

export type Client = z.infer<typeof clientSchema>;
export type Service = z.infer<typeof serviceSchema>;
export type InvoiceItemResponse = z.infer<typeof invoiceItemResponseSchema>;
export type InvoiceItemGroupResponse = z.infer<typeof invoiceItemGroupResponseSchema>;
export type InvoiceEvent = z.infer<typeof invoiceEventSchema>;
export type Payment = z.infer<typeof paymentSchema>;
export type Invoice = z.infer<typeof invoiceSchema>;
export type InvoiceListItem = z.infer<typeof invoiceListItemSchema>;
export type SenderProfile = z.infer<typeof senderProfileResponseSchema>;
export type PublicInvoice = z.infer<typeof publicInvoiceSchema>;
export type MonthlyRevenue = z.infer<typeof monthlyRevenueSchema>;
export type RecentInvoice = z.infer<typeof recentInvoiceSchema>;
export type CurrencyMetrics = z.infer<typeof currencyMetricsSchema>;
export type AnalyticsData = z.infer<typeof analyticsDataSchema>;
