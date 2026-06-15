import { PrismaClient } from '@prisma/client';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import type { FullDatabaseExport } from '../prisma/db-sync/export-full';
import { importFullDatabase } from '../prisma/db-sync/import-full';
import { summarizeExport } from '../prisma/db-sync/export-full';

const prisma = new PrismaClient();
const inPath = join(process.cwd(), 'prisma', 'seed-data', 'full-export.json');

async function main() {
  if (!existsSync(inPath)) {
    console.error(`❌ Missing ${inPath}. Run: npm run db:export:full`);
    process.exit(1);
  }

  const data = JSON.parse(readFileSync(inPath, 'utf8')) as FullDatabaseExport;
  console.log('Import summary from file:', summarizeExport(data));
  await importFullDatabase(prisma, data);
}

main()
  .catch((e) => {
    console.error('❌ Import failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
