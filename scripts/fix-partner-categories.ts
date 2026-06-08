import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TARGET_CATEGORIES = [
  { slug: 'medical-labs', name: 'Медицинские лаборатории' },
  { slug: 'insurance', name: 'Страховые компании' },
  { slug: 'dental-labs', name: 'Зуботехнические лаборатории' },
] as const;

const INSURANCE_NAMES = new Set([
  'белгосстрах',
  'таск',
  'ингосстрах',
  'асоба',
  'белэксимгарант',
  'купала',
  'белросстрах',
]);

function resolveCategorySlug(partnerName: string, currentSlug?: string | null): (typeof TARGET_CATEGORIES)[number]['slug'] {
  const name = partnerName.toLowerCase();
  const slug = (currentSlug || '').toLowerCase();

  if (INSURANCE_NAMES.has(name)) {
    return 'insurance';
  }

  if (
    slug.includes('dent') ||
    slug.includes('stomat') ||
    slug.includes('dental') ||
    name.includes('dental') ||
    name.includes('denta') ||
    name.includes('смайл')
  ) {
    return 'dental-labs';
  }

  if (
    slug.includes('gyne') ||
    slug.includes('ultra') ||
    slug.includes('diag') ||
    slug.includes('cardio') ||
    slug.includes('lab')
  ) {
    return 'medical-labs';
  }

  return 'medical-labs';
}

async function main() {
  const categoryIdBySlug = new Map<string, number>();

  for (const category of TARGET_CATEGORIES) {
    const upserted = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: { slug: category.slug, name: category.name },
      select: { id: true, slug: true },
    });
    categoryIdBySlug.set(upserted.slug, upserted.id);
  }

  const partners = await prisma.partner.findMany({
    select: {
      id: true,
      name: true,
      category: { select: { slug: true } },
    },
  });

  for (const partner of partners) {
    const targetSlug = resolveCategorySlug(partner.name, partner.category?.slug);
    const targetCategoryId = categoryIdBySlug.get(targetSlug);
    if (!targetCategoryId) continue;

    await prisma.partner.update({
      where: { id: partner.id },
      data: { category_id: targetCategoryId },
    });
  }

  const result = await prisma.partner.groupBy({
    by: ['category_id'],
    _count: { _all: true },
  });

  const categories = await prisma.category.findMany({
    where: { slug: { in: TARGET_CATEGORIES.map((c) => c.slug) } },
    select: { id: true, slug: true, name: true },
  });
  const catMap = new Map(categories.map((c) => [c.id, c]));

  const summary = result
    .map((r) => ({ category: catMap.get(r.category_id), count: r._count._all }))
    .filter((r) => r.category)
    .sort((a, b) => a.category!.slug.localeCompare(b.category!.slug));

  console.log('Partner categories fixed:', JSON.stringify(summary, null, 2));
}

main()
  .catch((e) => {
    console.error('Failed to fix partner categories:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
