import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding partner categories...');

  const categories = [
    { name: 'Медицинские лаборатории', slug: 'medical-labs' },
    { name: 'Страховые компании', slug: 'insurance' },
    { name: 'Зуботехнические лаборатории', slug: 'dental-labs' },
  ];

  for (const category of categories) {
    const existing = await prisma.category.findUnique({
      where: { slug: category.slug },
    });

    if (!existing) {
      await prisma.category.create({
        data: category,
      });
      console.log(`✅ Created category: ${category.name} (${category.slug})`);
    } else {
      console.log(`⏭️  Category already exists: ${category.name} (${category.slug})`);
    }
  }

  console.log('✨ Partner categories seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding partner categories:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
