declare const brand: unique symbol;

export type Branded<T, B extends string> = T & { readonly [brand]: B };

export type UserId = Branded<string, "UserId">;
export type InvoiceId = Branded<string, "InvoiceId">;
export type ClientId = Branded<string, "ClientId">;
export type PaymentId = Branded<string, "PaymentId">;
export type PublicId = Branded<string, "PublicId">;
export type ServiceId = Branded<string, "ServiceId">;

export const asUserId = (id: string): UserId => id as UserId;
export const asInvoiceId = (id: string): InvoiceId => id as InvoiceId;
export const asClientId = (id: string): ClientId => id as ClientId;
export const asPaymentId = (id: string): PaymentId => id as PaymentId;
export const asPublicId = (id: string): PublicId => id as PublicId;
export const asServiceId = (id: string): ServiceId => id as ServiceId;
