import type { Service } from "@prisma/client";

import { CreateServiceInput, UpdateServiceInput } from "@app/shared/schemas";
import type { ServiceId, UserId } from "@app/shared/types/ids";

import { prisma } from "@app/server/db";

export class ServiceInUseError extends Error {
  constructor(public invoiceItemCount: number) {
    super("Service is referenced by existing invoice items");
    this.name = "ServiceInUseError";
  }
}

export async function getServices(userId: UserId): Promise<Service[]> {
  return prisma.service.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getService(id: ServiceId, userId: UserId): Promise<Service | null> {
  return prisma.service.findFirst({
    where: { id, userId },
  });
}

export async function createService(userId: UserId, data: CreateServiceInput): Promise<Service> {
  return prisma.service.create({
    data: {
      userId,
      name: data.name,
      description: data.description ?? null,
      unit: data.unit ?? null,
      defaultPrice: data.defaultPrice,
      active: data.active ?? true,
    },
  });
}

export async function updateService(
  id: ServiceId,
  userId: UserId,
  data: UpdateServiceInput
): Promise<Service | null> {
  const service = await prisma.service.findFirst({
    where: { id, userId },
  });

  if (!service) {
    return null;
  }

  return prisma.service.update({
    where: { id },
    data: {
      name: data.name ?? service.name,
      description:
        data.description !== undefined ? (data.description ?? null) : service.description,
      unit: data.unit !== undefined ? (data.unit ?? null) : service.unit,
      defaultPrice: data.defaultPrice ?? service.defaultPrice,
      active: data.active ?? service.active,
    },
  });
}

export async function deleteService(id: ServiceId, userId: UserId): Promise<Service | null> {
  const service = await prisma.service.findFirst({
    where: { id, userId },
  });

  if (!service) {
    return null;
  }

  const itemCount = await prisma.invoiceItem.count({ where: { serviceId: id } });

  if (itemCount > 0) {
    throw new ServiceInUseError(itemCount);
  }

  return prisma.service.delete({ where: { id } });
}
