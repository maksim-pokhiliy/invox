import { faker } from "@faker-js/faker";
import type { Prisma, PrismaClient, Service } from "@prisma/client";

type ServiceOverrides = Partial<Prisma.ServiceUncheckedCreateInput> & { userId: string };

export function makeService(overrides: ServiceOverrides): Prisma.ServiceUncheckedCreateInput {
  return {
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    unit: faker.helpers.arrayElement(["hour", "day", "piece", "project", null]),
    defaultPrice: faker.number.int({ min: 100, max: 2000000 }),
    active: true,
    ...overrides,
  };
}

export function createService(prisma: PrismaClient, overrides: ServiceOverrides): Promise<Service> {
  return prisma.service.create({ data: makeService(overrides) });
}
