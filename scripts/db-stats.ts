import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const [categories, specialists, services, links] = await Promise.all([
    prisma.serviceCategory.count(),
    prisma.specialist.count(),
    prisma.service.count(),
    prisma.serviceSpecialist.count(),
  ]);
  console.log({ categories, specialists, services, links });
}

main()
  .finally(() => prisma.$disconnect());
