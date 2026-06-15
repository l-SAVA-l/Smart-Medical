import { PrismaClient } from '@prisma/client';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { exportFullDatabase, summarizeExport } from '../prisma/db-sync/export-full';

const prisma = new PrismaClient();
const outPath = join(process.cwd(), 'prisma', 'seed-data', 'full-export.json');

async function main() {
  const data = await exportFullDatabase(prisma);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf8');

  console.log(`✅ Exported full database to ${outPath}`);
  console.log(summarizeExport(data));
}

main()
  .catch((e) => {
    console.error('❌ Export failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
