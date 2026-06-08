/**
 * Заполняет service_specialists: врач (корневая/родительская категория)
 * + услуга (листовая категория) связываются, если категория врача
 * является предком категории услуги в дереве service_categories.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function loadCategoryMap() {
  const cats = await prisma.serviceCategory.findMany({
    select: { id: true, parent_id: true },
  });
  const parentById = new Map(cats.map((c) => [c.id, c.parent_id]));
  return parentById;
}

function getAncestorIds(categoryId, parentById) {
  const ids = new Set();
  let current = categoryId;
  while (current != null) {
    ids.add(current);
    current = parentById.get(current) ?? null;
  }
  return ids;
}

async function main() {
  const parentById = await loadCategoryMap();
  const specialists = await prisma.specialist.findMany({
    select: { id: true, service_category_id: true },
  });

  const specialistsByCategory = new Map();
  for (const s of specialists) {
    if (!specialistsByCategory.has(s.service_category_id)) {
      specialistsByCategory.set(s.service_category_id, []);
    }
    specialistsByCategory.get(s.service_category_id).push(s.id);
  }

  const services = await prisma.service.findMany({
    select: { id: true, title: true, service_category_id: true },
  });

  let created = 0;
  for (const service of services) {
    const ancestors = getAncestorIds(service.service_category_id, parentById);
    const specialistIds = new Set();
    for (const catId of ancestors) {
      const list = specialistsByCategory.get(catId);
      if (list) list.forEach((id) => specialistIds.add(id));
    }
    for (const specialistId of specialistIds) {
      await prisma.serviceSpecialist.upsert({
        where: {
          service_id_specialist_id: {
            service_id: service.id,
            specialist_id: specialistId,
          },
        },
        create: { service_id: service.id, specialist_id: specialistId },
        update: {},
      });
      created++;
    }
  }

  const total = await prisma.serviceSpecialist.count();
  console.log(`Services: ${services.length}, specialists: ${specialists.length}`);
  console.log(`Links created/updated: ${created}, total in DB: ${total}`);

  const sample = await prisma.service.findFirst({
    where: { title: { contains: 'кариес', mode: 'insensitive' } },
    include: { specialists: { include: { specialist: { select: { name: true } } } } },
  });
  if (sample) {
    console.log(
      `Sample "${sample.title}":`,
      sample.specialists.map((x) => x.specialist.name).join(', ') || '(none)'
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
