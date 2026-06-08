import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const isDryRun = !process.argv.includes('--apply');

  // Schema is already migrated to new structure (legacy columns removed).
  // This script now serves as an idempotent integrity check.
  const [serviceCount, specialistCount, questionCount, clinicFaqMissingCategory] =
    await Promise.all([
      prisma.service.count(),
      prisma.specialist.count(),
      prisma.question.count(),
      prisma.question.count({
        where: {
          service_id: null,
          question_category_id: null,
        },
      }),
    ]);

  console.log(
    JSON.stringify(
      {
        mode: isDryRun ? 'dry-run' : 'apply',
        services: { total: serviceCount, updated: 0, unmatched: 0, unmatchedSample: [] },
        specialists: { total: specialistCount, updated: 0, unmatched: 0, unmatchedSample: [] },
        questions: {
          total: questionCount,
          updated: 0,
          unmatched: clinicFaqMissingCategory,
          createdCategories: 0,
          unmatchedSample: [],
        },
      },
      null,
      2
    )
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
