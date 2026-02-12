import { notFound } from "next/navigation";

import { BRANDING } from "@app/shared/config/config";

import PublicInvoiceView from "@app/features/public-invoice/components/public-invoice-view";

import { getInvoiceByPublicId } from "@app/server/invoices";

interface Props {
  params: Promise<{ publicId: string }>;
  searchParams: Promise<{ paid?: string }>;
}

export default async function PublicInvoicePage({ params, searchParams }: Props) {
  const { publicId } = await params;
  const { paid } = await searchParams;

  const invoice = await getInvoiceByPublicId(publicId);

  if (!invoice) {
    notFound();
  }

  const senderProfile = invoice.user.senderProfile;
  const senderName = senderProfile?.companyName || senderProfile?.displayName || invoice.user.email;

  const senderAddress = senderProfile?.address || "";
  const senderTaxId = senderProfile?.taxId || "";

  const branding = {
    logoUrl: senderProfile?.logoUrl || null,
    primaryColor: senderProfile?.primaryColor || BRANDING.DEFAULT_PRIMARY_COLOR,
    accentColor: senderProfile?.accentColor || BRANDING.DEFAULT_ACCENT_COLOR,
    fontFamily: senderProfile?.fontFamily || null,
  };

  return (
    <PublicInvoiceView
      publicId={publicId}
      invoice={{
        id: invoice.id,
        publicId: invoice.publicId,
        status: invoice.status,
        currency: invoice.currency,
        subtotal: invoice.subtotal,
        total: invoice.total,
        dueDate: invoice.dueDate.toISOString(),
        paidAt: invoice.paidAt?.toISOString() || null,
        createdAt: invoice.createdAt.toISOString(),
        paymentReference: invoice.paymentReference || null,
        client: {
          name: invoice.client.name,
          email: invoice.client.email,
        },
        items: invoice.items.map((item) => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.amount,
        })),
        itemGroups: invoice.itemGroups.map((group) => ({
          id: group.id,
          title: group.title,
          items: group.items.map((item) => ({
            id: item.id,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.amount,
          })),
        })),
        sender: {
          name: senderName,
          address: senderAddress,
          taxId: senderTaxId,
        },
      }}
      branding={branding}
      justPaid={paid === "1"}
    />
  );
}
