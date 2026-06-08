import { PrismaClient } from '@prisma/client';
import { getServiceSlugByTitle } from '../src/utils/serviceMapping';

const prisma = new PrismaClient();

type MatchSource = 'mapping-by-title' | 'fallback-root-category';

async function main() {
  const isDryRun = !process.argv.includes('--apply');

  const serviceCategories = await prisma.serviceCategory.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      parent_id: true,
      is_active: true,
    },
  });

  const serviceCategoryIdBySlug = new Map(
    serviceCategories.map((category) => [category.slug, category.id])
  );

  const services = await prisma.service.findMany({
    where: {
      service_category_id: null,
    },
    select: {
      id: true,
      title: true,
      category_id: true,
      category: {
        select: {
          id: true,
          slug: true,
          name: true,
        },
      },
    },
    orderBy: {
      id: 'asc',
    },
  });

  const updates: Array<{
    serviceId: number;
    title: string;
    oldCategorySlug: string | null;
    targetServiceCategorySlug: string;
    targetServiceCategoryId: number;
    source: MatchSource;
  }> = [];

  const unmatched: Array<{
    serviceId: number;
    title: string;
    oldCategoryId: number;
    oldCategorySlug: string | null;
  }> = [];

  for (const service of services) {
    const oldCategorySlug = service.category?.slug ?? null;
    const oldCategoryId = service.category_id;
    let targetSlug: string | null = null;
    let source: MatchSource | null = null;

    if (oldCategorySlug) {
      const mappedSlug = getServiceSlugByTitle(oldCategorySlug, service.title);
      if (mappedSlug && serviceCategoryIdBySlug.has(mappedSlug)) {
        targetSlug = mappedSlug;
        source = 'mapping-by-title';
      }
    }

    if (!targetSlug && oldCategorySlug && serviceCategoryIdBySlug.has(oldCategorySlug)) {
      targetSlug = oldCategorySlug;
      source = 'fallback-root-category';
    }

    if (!targetSlug || !source) {
      unmatched.push({
        serviceId: service.id,
        title: service.title,
        oldCategoryId,
        oldCategorySlug,
      });
      continue;
    }

    const targetServiceCategoryId = serviceCategoryIdBySlug.get(targetSlug)!;
    updates.push({
      serviceId: service.id,
      title: service.title,
      oldCategorySlug,
      targetServiceCategorySlug: targetSlug,
      targetServiceCategoryId,
      source,
    });
  }

  if (!isDryRun) {
    for (const update of updates) {
      await prisma.service.update({
        where: { id: update.serviceId },
        data: { service_category_id: update.targetServiceCategoryId },
      });
    }
  }

  const bySource = updates.reduce<Record<MatchSource, number>>(
    (acc, update) => {
      acc[update.source] += 1;
      return acc;
    },
    {
      'mapping-by-title': 0,
      'fallback-root-category': 0,
    }
  );

  console.log(
    JSON.stringify(
      {
        mode: isDryRun ? 'dry-run' : 'apply',
        totalServicesWithoutServiceCategory: services.length,
        toBeUpdated: updates.length,
        unmatched: unmatched.length,
        matchedBreakdown: bySource,
        unmatchedSample: unmatched.slice(0, 30),
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
