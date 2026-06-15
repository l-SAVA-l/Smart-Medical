import { Prisma, PrismaClient } from '@prisma/client';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { makeCatalogKey } from './db-sync/keys';

export type CatalogSpecialist = {
  key: string;
  categorySlug: string;
  name: string;
  specialization: string;
  qualification: string;
  experience: number;
  grade: number;
  image_url: string;
  activity_area: string | null;
  education_details: string | null;
  conferences: string[];
  specializations: string[];
  education: string[];
  work_examples: Prisma.JsonValue | null;
};

export type CatalogService = {
  key: string;
  categorySlug: string;
  title: string;
  subtitle: string;
  price: number;
  video_url: string;
  description: string;
  image_url: string;
  image_url_1: string;
  image_url_2: string;
  image_url_3: string;
  image_url_4: string | null;
  questions_id: number;
  reviews_id: number;
  specialistKeys: string[];
};

export type CatalogExport = {
  exportedAt: string;
  specialists: CatalogSpecialist[];
  services: CatalogService[];
};

function loadCatalog(): CatalogExport | null {
  const path = join(process.cwd(), 'prisma', 'seed-data', 'catalog.json');
  if (!existsSync(path)) {
    return null;
  }
  return JSON.parse(readFileSync(path, 'utf8')) as CatalogExport;
}

export async function seedCatalog(prisma: PrismaClient) {
  const catalog = loadCatalog();
  if (!catalog) {
    console.log('ℹ️  prisma/seed-data/catalog.json not found — skip services/specialists');
    console.log('   Export from local: npm run db:export:catalog');
    return;
  }

  console.log(`🌱 Seeding catalog from export (${catalog.exportedAt})...`);

  const categories = await prisma.serviceCategory.findMany({
    select: { id: true, slug: true },
  });
  const categoryIdBySlug = new Map(categories.map((c) => [c.slug, c.id]));

  const specialistIdByKey = new Map<string, number>();

  for (const item of catalog.specialists) {
    const categoryId = categoryIdBySlug.get(item.categorySlug);
    if (!categoryId) {
      console.warn(`  ⚠ Skip specialist "${item.name}" — unknown category ${item.categorySlug}`);
      continue;
    }

    const existing = await prisma.specialist.findFirst({
      where: {
        name: item.name,
        service_category_id: categoryId,
      },
    });

    const data = {
      name: item.name,
      specialization: item.specialization,
      qualification: item.qualification,
      experience: item.experience,
      grade: item.grade,
      image_url: item.image_url,
      activity_area: item.activity_area,
      education_details: item.education_details,
      conferences: item.conferences,
      specializations: item.specializations,
      education: item.education,
      work_examples: item.work_examples as Prisma.InputJsonValue,
      service_category_id: categoryId,
    };

    const record = existing
      ? await prisma.specialist.update({ where: { id: existing.id }, data })
      : await prisma.specialist.create({ data });

    specialistIdByKey.set(item.key, record.id);
  }

  console.log(`  ✓ specialists: ${specialistIdByKey.size}`);

  const serviceIdByKey = new Map<string, number>();

  for (const item of catalog.services) {
    const categoryId = categoryIdBySlug.get(item.categorySlug);
    if (!categoryId) {
      console.warn(`  ⚠ Skip service "${item.title}" — unknown category ${item.categorySlug}`);
      continue;
    }

    const existing = await prisma.service.findFirst({
      where: {
        title: item.title,
        service_category_id: categoryId,
      },
    });

    const data = {
      title: item.title,
      subtitle: item.subtitle,
      price: item.price,
      video_url: item.video_url,
      description: item.description,
      image_url: item.image_url,
      image_url_1: item.image_url_1,
      image_url_2: item.image_url_2,
      image_url_3: item.image_url_3,
      image_url_4: item.image_url_4,
      questions_id: item.questions_id || 1,
      reviews_id: item.reviews_id || 1,
      service_category_id: categoryId,
    };

    const record = existing
      ? await prisma.service.update({ where: { id: existing.id }, data })
      : await prisma.service.create({ data });

    serviceIdByKey.set(item.key, record.id);
  }

  console.log(`  ✓ services: ${serviceIdByKey.size}`);

  let links = 0;
  for (const item of catalog.services) {
    const serviceId = serviceIdByKey.get(item.key);
    if (!serviceId) continue;

    for (const specialistKey of item.specialistKeys) {
      const specialistId = specialistIdByKey.get(specialistKey);
      if (!specialistId) continue;

      await prisma.serviceSpecialist.upsert({
        where: {
          service_id_specialist_id: {
            service_id: serviceId,
            specialist_id: specialistId,
          },
        },
        create: { service_id: serviceId, specialist_id: specialistId },
        update: {},
      });
      links++;
    }
  }

  console.log(`  ✓ service_specialists links: ${links}`);
  console.log('✅ Catalog seeded');
}
