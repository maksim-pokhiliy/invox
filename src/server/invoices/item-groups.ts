import { Prisma } from "@prisma/client";

import type { LineItemGroupInput, LineItemInput } from "@app/shared/schemas";
import { InvoiceItemGroupInput } from "@app/shared/schemas";

import { prisma } from "@app/server/db";

type PrismaClientLike = Prisma.TransactionClient | typeof prisma;

interface ItemRowBase {
  groupId: string;
  title: string;
  description: string | null;
  quantity: number;
  unitPrice: number;
  sortOrder: number;
  serviceId: string | null;
}

export function buildItemRowBase(
  item: LineItemInput,
  groupId: string,
  sortOrder: number
): ItemRowBase {
  return {
    groupId,
    title: item.title,
    description: item.description ?? null,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    sortOrder,
    serviceId: item.serviceId ?? null,
  };
}

interface CreateItemGroupsOptions<TItemRow> {
  groups: LineItemGroupInput[];
  createGroup: (input: { title: string; sortOrder: number }) => Promise<{ id: string }>;
  buildItemRow: (item: LineItemInput, groupId: string, sortOrder: number) => TItemRow;
  createManyItems: (rows: TItemRow[]) => Promise<unknown>;
}

export async function createItemGroupsGeneric<TItemRow>(
  options: CreateItemGroupsOptions<TItemRow>
): Promise<void> {
  for (let gi = 0; gi < options.groups.length; gi++) {
    const group = options.groups[gi];
    const created = await options.createGroup({ title: group.title, sortOrder: gi });

    if (group.items.length > 0) {
      await options.createManyItems(
        group.items.map((item, ii) => options.buildItemRow(item, created.id, ii))
      );
    }
  }
}

export async function createItemGroups(
  tx: PrismaClientLike,
  invoiceId: string,
  groups: InvoiceItemGroupInput[]
) {
  await createItemGroupsGeneric({
    groups,
    createGroup: ({ title, sortOrder }) =>
      tx.invoiceItemGroup.create({ data: { invoiceId, title, sortOrder } }),
    buildItemRow: (item, groupId, sortOrder) => ({
      ...buildItemRowBase(item, groupId, sortOrder),
      invoiceId,
      amount: Math.round(item.quantity * item.unitPrice),
    }),
    createManyItems: (data) => tx.invoiceItem.createMany({ data }),
  });
}

export const ITEM_GROUPS_INCLUDE = {
  include: { items: { orderBy: { sortOrder: "asc" as const } } },
  orderBy: { sortOrder: "asc" as const },
};
