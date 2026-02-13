import type { CreateClientInput, InvoiceItemGroupInput } from "@app/shared/schemas";

export type { FormMode as InvoiceFormMode } from "@app/shared/config/config";

export interface TemplateData {
  name: string;
  currency: string;
  dueDays: number;
  notes: string | null;
  items: { title: string; description: string | null; quantity: number; unitPrice: number }[];
  itemGroups: {
    title: string;
    items: { title: string; description: string | null; quantity: number; unitPrice: number }[];
  }[];
}

export interface CreateClientMutation {
  mutate: (
    data: CreateClientInput,
    options: {
      onSuccess: () => void;
      onError: (err: Error) => void;
    }
  ) => void;
  isPending: boolean;
}

export interface InvoiceInitialData {
  clientId: string;
  currency: string;
  dueDate: string;
  items: { title: string; description: string; quantity: number; unitPrice: number }[];
  itemGroups?: InvoiceItemGroupInput[];
  notes: string;
}
