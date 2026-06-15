import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function maskDatabaseUrl(url: string | undefined) {
  if (!url) return '(not set)';
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.username}:***@${parsed.host}${parsed.pathname}`;
  } catch {
    return '(invalid DATABASE_URL)';
  }
}

async function main() {
  const url = process.env.DATABASE_URL;
  console.log('DATABASE_URL:', maskDatabaseUrl(url));

  const [categories, specialists, services, links, patients] = await Promise.all([
    prisma.serviceCategory.count(),
    prisma.specialist.count(),
    prisma.service.count(),
    prisma.serviceSpecialist.count(),
    prisma.patient.count(),
  ]);

  console.log('Counts:', { categories, specialists, services, links, patients });

  const sample = await prisma.specialist.findFirst({
    select: { id: true, name: true },
    orderBy: { id: 'asc' },
  });
  console.log('Sample specialist:', sample ?? '(none)');
}

main()
  .finally(() => prisma.$disconnect());
