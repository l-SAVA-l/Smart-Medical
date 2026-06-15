import { PrismaClient } from '@prisma/client';
import { seedCatalog } from '../prisma/seed-catalog';

const prisma = new PrismaClient();

seedCatalog(prisma)
  .catch((e) => {
    console.error('❌ Import failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
