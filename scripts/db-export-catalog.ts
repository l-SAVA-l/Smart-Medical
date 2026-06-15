import { PrismaClient } from '@prisma/client';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { makeCatalogKey, type CatalogExport } from '../prisma/seed-catalog';

const prisma = new PrismaClient();
const outPath = join(process.cwd(), 'prisma', 'seed-data', 'catalog.json');

async function getCategorySlugMap() {
  const categories = await prisma.serviceCategory.findMany({
    select: { id: true, slug: true },
  });
  return new Map(categories.map((c) => [c.id, c.slug]));
}

async function main() {
  const categorySlugById = await getCategorySlugMap();

  const specialistsRaw = await prisma.specialist.findMany({
    orderBy: { id: 'asc' },
  });

  const servicesRaw = await prisma.service.findMany({
    include: {
      specialists: { select: { specialist_id: true } },
    },
    orderBy: { id: 'asc' },
  });

  const specialistIdToKey = new Map<number, string>();

  const specialists = specialistsRaw.map((s) => {
    const categorySlug = categorySlugById.get(s.service_category_id);
    if (!categorySlug) {
      throw new Error(`Specialist ${s.id} has unknown category ${s.service_category_id}`);
    }
    const key = makeCatalogKey(s.name, categorySlug);
    specialistIdToKey.set(s.id, key);
    return {
      key,
      categorySlug,
      name: s.name,
      specialization: s.specialization,
      qualification: s.qualification,
      experience: s.experience,
      grade: s.grade,
      image_url: s.image_url,
      activity_area: s.activity_area,
      education_details: s.education_details,
      conferences: s.conferences,
      specializations: s.specializations,
      education: s.education,
      work_examples: s.work_examples,
    };
  });

  const services = servicesRaw.map((s) => {
    const categorySlug = categorySlugById.get(s.service_category_id);
    if (!categorySlug) {
      throw new Error(`Service ${s.id} has unknown category ${s.service_category_id}`);
    }
    const key = makeCatalogKey(s.title, categorySlug);
    return {
      key,
      categorySlug,
      title: s.title,
      subtitle: s.subtitle,
      price: s.price,
      video_url: s.video_url,
      description: s.description,
      image_url: s.image_url,
      image_url_1: s.image_url_1,
      image_url_2: s.image_url_2,
      image_url_3: s.image_url_3,
      image_url_4: s.image_url_4,
      questions_id: s.questions_id,
      reviews_id: s.reviews_id,
      specialistKeys: s.specialists
        .map((link) => specialistIdToKey.get(link.specialist_id))
        .filter((k): k is string => Boolean(k)),
    };
  });

  const payload: CatalogExport = {
    exportedAt: new Date().toISOString(),
    specialists,
    services,
  };

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(payload, null, 2), 'utf8');

  console.log(`✅ Exported catalog to ${outPath}`);
  console.log(`   specialists: ${specialists.length}`);
  console.log(`   services: ${services.length}`);
  console.log(
    `   links: ${services.reduce((sum, s) => sum + s.specialistKeys.length, 0)}`
  );
}

main()
  .catch((e) => {
    console.error('❌ Export failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
