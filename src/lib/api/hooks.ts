"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  clientsApi,
  invoicesApi,
  senderProfileApi,
  publicApi,
  analyticsApi,
  templatesApi,
  remindersApi,
  stripeApi,
  recurringApi,
  type RecordPaymentInput,
  type CreateTemplateInput,
  type UpdateTemplateInput,
  type Template,
  type ReminderSettings,
  type RecurringInvoice,
  type CreateRecurringInput,
  type UpdateRecurringInput,
} from "./client";
import type { CreateClientInput, UpdateClientInput } from "@app/shared/schemas/client";
import type { CreateInvoiceInput, UpdateInvoiceInput } from "@app/shared/schemas/invoice";
import type { SenderProfileInput } from "@app/shared/schemas/sender-profile";
import type { Client, InvoiceListItem, Invoice } from "@app/shared/schemas/api";

// Query keys for cache management
export const queryKeys = {
  clients: ["clients"] as const,
  invoices: ["invoices"] as const,
  invoice: (id: string) => ["invoice", id] as const,
  senderProfile: ["sender-profile"] as const,
  publicInvoice: (publicId: string) => ["public-invoice", publicId] as const,
  analytics: ["analytics"] as const,
  templates: ["templates"] as const,
  template: (id: string) => ["template", id] as const,
  reminderSettings: ["reminder-settings"] as const,
  recurring: ["recurring"] as const,
  recurringItem: (id: string) => ["recurring", id] as const,
};

// Stale time constants
const STALE_TIME = {
  short: 30 * 1000, // 30 seconds
  medium: 60 * 1000, // 1 minute
  long: 5 * 60 * 1000, // 5 minutes
} as const;

// Clients hooks
export function useClients() {
  return useQuery({
    queryKey: queryKeys.clients,
    queryFn: clientsApi.list,
    staleTime: STALE_TIME.medium,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClientInput) => clientsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClientInput }) =>
      clientsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients });
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => clientsApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.clients });
      const previousClients = queryClient.getQueryData<Client[]>(queryKeys.clients);
      queryClient.setQueryData<Client[]>(queryKeys.clients, (old) =>
        old?.filter((client) => client.id !== id)
      );
      return { previousClients };
    },
    onError: (_, __, context) => {
      if (context?.previousClients) {
        queryClient.setQueryData(queryKeys.clients, context.previousClients);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients });
    },
  });
}

// Invoices hooks
export function useInvoices() {
  return useQuery({
    queryKey: queryKeys.invoices,
    queryFn: invoicesApi.list,
    staleTime: STALE_TIME.short,
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: queryKeys.invoice(id),
    queryFn: () => invoicesApi.get(id),
    staleTime: STALE_TIME.medium,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInvoiceInput) => invoicesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInvoiceInput }) =>
      invoicesApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoice(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
    },
  });
}

export function useSendInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => invoicesApi.send(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.invoices });
      await queryClient.cancelQueries({ queryKey: queryKeys.invoice(id) });

      const previousInvoices = queryClient.getQueryData<InvoiceListItem[]>(queryKeys.invoices);
      const previousInvoice = queryClient.getQueryData<Invoice>(queryKeys.invoice(id));

      queryClient.setQueryData<InvoiceListItem[]>(queryKeys.invoices, (old) =>
        old?.map((invoice) =>
          invoice.id === id
            ? { ...invoice, status: "SENT" as const, sentAt: new Date().toISOString() }
            : invoice
        )
      );

      queryClient.setQueryData<Invoice>(queryKeys.invoice(id), (old) =>
        old ? { ...old, status: "SENT" as const, sentAt: new Date().toISOString() } : old
      );

      return { previousInvoices, previousInvoice };
    },
    onError: (_, id, context) => {
      if (context?.previousInvoices) {
        queryClient.setQueryData(queryKeys.invoices, context.previousInvoices);
      }
      if (context?.previousInvoice) {
        queryClient.setQueryData(queryKeys.invoice(id), context.previousInvoice);
      }
    },
    onSettled: (_, __, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoice(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
    },
  });
}

export function useMarkInvoicePaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => invoicesApi.markPaid(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.invoices });
      await queryClient.cancelQueries({ queryKey: queryKeys.invoice(id) });

      const previousInvoices = queryClient.getQueryData<InvoiceListItem[]>(queryKeys.invoices);
      const previousInvoice = queryClient.getQueryData<Invoice>(queryKeys.invoice(id));

      queryClient.setQueryData<InvoiceListItem[]>(queryKeys.invoices, (old) =>
        old?.map((invoice) =>
          invoice.id === id
            ? { ...invoice, status: "PAID" as const, paidAt: new Date().toISOString() }
            : invoice
        )
      );

      queryClient.setQueryData<Invoice>(queryKeys.invoice(id), (old) =>
        old ? { ...old, status: "PAID" as const, paidAt: new Date().toISOString() } : old
      );

      return { previousInvoices, previousInvoice };
    },
    onError: (_, id, context) => {
      if (context?.previousInvoices) {
        queryClient.setQueryData(queryKeys.invoices, context.previousInvoices);
      }
      if (context?.previousInvoice) {
        queryClient.setQueryData(queryKeys.invoice(id), context.previousInvoice);
      }
    },
    onSettled: (_, __, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoice(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => invoicesApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.invoices });
      const previousInvoices = queryClient.getQueryData<InvoiceListItem[]>(queryKeys.invoices);
      queryClient.setQueryData<InvoiceListItem[]>(queryKeys.invoices, (old) =>
        old?.filter((invoice) => invoice.id !== id)
      );
      return { previousInvoices };
    },
    onError: (_, __, context) => {
      if (context?.previousInvoices) {
        queryClient.setQueryData(queryKeys.invoices, context.previousInvoices);
      }
    },
    onSettled: (_, __, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.invoice(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
    },
  });
}

export function useDuplicateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => invoicesApi.duplicate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
    },
  });
}

// Payment hooks
export function useRecordPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ invoiceId, data }: { invoiceId: string; data: RecordPaymentInput }) =>
      invoicesApi.recordPayment(invoiceId, data),
    onSuccess: (_, { invoiceId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoice(invoiceId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics });
    },
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ invoiceId, paymentId }: { invoiceId: string; paymentId: string }) =>
      invoicesApi.deletePayment(invoiceId, paymentId),
    onSuccess: (_, { invoiceId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoice(invoiceId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics });
    },
  });
}

// Sender Profile hooks
export function useSenderProfile() {
  return useQuery({
    queryKey: queryKeys.senderProfile,
    queryFn: senderProfileApi.get,
    staleTime: STALE_TIME.long,
  });
}

export function useCreateSenderProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SenderProfileInput) => senderProfileApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.senderProfile });
    },
  });
}

export function useUpdateSenderProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SenderProfileInput) => senderProfileApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.senderProfile });
    },
  });
}

// Public invoice hooks
export function usePublicInvoice(publicId: string) {
  return useQuery({
    queryKey: queryKeys.publicInvoice(publicId),
    queryFn: () => publicApi.getInvoice(publicId),
    staleTime: STALE_TIME.medium,
  });
}

export function useMarkInvoiceViewed() {
  return useMutation({
    mutationFn: (publicId: string) => publicApi.markViewed(publicId),
  });
}

export function useCreateCheckoutSession() {
  return useMutation({
    mutationFn: (invoiceId: string) => publicApi.createCheckoutSession(invoiceId),
  });
}

// Prefetch hooks for data loading optimization
export function usePrefetchInvoice() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.invoice(id),
      queryFn: () => invoicesApi.get(id),
      staleTime: STALE_TIME.medium,
    });
  };
}

export function usePrefetchClients() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.clients,
      queryFn: clientsApi.list,
      staleTime: STALE_TIME.medium,
    });
  };
}

export function usePrefetchInvoices() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.invoices,
      queryFn: invoicesApi.list,
      staleTime: STALE_TIME.short,
    });
  };
}

export function usePrefetchSenderProfile() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.senderProfile,
      queryFn: senderProfileApi.get,
      staleTime: STALE_TIME.long,
    });
  };
}

// Analytics hooks
export function useAnalytics() {
  return useQuery({
    queryKey: queryKeys.analytics,
    queryFn: analyticsApi.get,
    staleTime: STALE_TIME.medium,
  });
}

// Templates hooks
export function useTemplates() {
  return useQuery({
    queryKey: queryKeys.templates,
    queryFn: templatesApi.list,
    staleTime: STALE_TIME.medium,
  });
}

export function useTemplate(id: string) {
  return useQuery({
    queryKey: queryKeys.template(id),
    queryFn: () => templatesApi.get(id),
    enabled: !!id,
    staleTime: STALE_TIME.medium,
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTemplateInput) => templatesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.templates });
    },
  });
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTemplateInput }) =>
      templatesApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.template(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.templates });
    },
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => templatesApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.templates });
      const previousTemplates = queryClient.getQueryData<Template[]>(queryKeys.templates);
      queryClient.setQueryData<Template[]>(queryKeys.templates, (old) =>
        old?.filter((template) => template.id !== id)
      );
      return { previousTemplates };
    },
    onError: (_, __, context) => {
      if (context?.previousTemplates) {
        queryClient.setQueryData(queryKeys.templates, context.previousTemplates);
      }
    },
    onSettled: (_, __, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.template(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.templates });
    },
  });
}

// Reminder settings hooks
export function useReminderSettings() {
  return useQuery({
    queryKey: queryKeys.reminderSettings,
    queryFn: remindersApi.get,
    staleTime: STALE_TIME.long,
  });
}

export function useUpdateReminderSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReminderSettings) => remindersApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reminderSettings });
    },
  });
}

// Stripe hooks
export function useDisconnectStripe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => stripeApi.disconnect(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.senderProfile });
    },
  });
}

// Recurring invoice hooks
export function useRecurringInvoices() {
  return useQuery({
    queryKey: queryKeys.recurring,
    queryFn: recurringApi.list,
    staleTime: STALE_TIME.medium,
  });
}

export function useRecurringInvoice(id: string) {
  return useQuery({
    queryKey: queryKeys.recurringItem(id),
    queryFn: () => recurringApi.get(id),
    enabled: !!id,
    staleTime: STALE_TIME.medium,
  });
}

export function useCreateRecurring() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRecurringInput) => recurringApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recurring });
    },
  });
}

export function useUpdateRecurring() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRecurringInput }) =>
      recurringApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recurringItem(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.recurring });
    },
  });
}

export function useDeleteRecurring() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => recurringApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.recurring });
      const previous = queryClient.getQueryData<RecurringInvoice[]>(queryKeys.recurring);
      queryClient.setQueryData<RecurringInvoice[]>(queryKeys.recurring, (old) =>
        old?.filter((r) => r.id !== id)
      );
      return { previous };
    },
    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.recurring, context.previous);
      }
    },
    onSettled: (_, __, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.recurringItem(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.recurring });
    },
  });
}

export function useGenerateFromRecurring() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => recurringApi.generate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recurringItem(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.recurring });
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
    },
  });
}
