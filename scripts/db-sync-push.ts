import { config } from 'dotenv';
import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';
import { exportFullDatabase, summarizeExport } from '../prisma/db-sync/export-full';
import { importFullDatabase } from '../prisma/db-sync/import-full';

function loadEnvPair() {
  const localPath = resolve('.env.local');
  const remotePath = resolve('.env');

  delete process.env.DATABASE_URL;
  delete process.env.SOURCE_DATABASE_URL;
  delete process.env.TARGET_DATABASE_URL;

  config({ path: localPath });
  const sourceUrl = process.env.SOURCE_DATABASE_URL || process.env.DATABASE_URL;

  delete process.env.DATABASE_URL;
  config({ path: remotePath });
  const targetUrl = process.env.TARGET_DATABASE_URL || process.env.DATABASE_URL;

  if (!sourceUrl) {
    throw new Error(
      'SOURCE not set. Create .env.local with DATABASE_URL=postgresql://...@localhost:5432/smartmedical'
    );
  }
  if (!targetUrl) {
    throw new Error('TARGET not set. Set DATABASE_URL in .env to Neon/production URL');
  }
  if (sourceUrl === targetUrl) {
    throw new Error('SOURCE and TARGET DATABASE_URL are the same — aborting');
  }

  return { sourceUrl, targetUrl };
}

function maskUrl(url: string) {
  try {
    const parsed = new URL(url);
    return `${parsed.host}${parsed.pathname}`;
  } catch {
    return '(invalid url)';
  }
}

async function main() {
  const { sourceUrl, targetUrl } = loadEnvPair();
  console.log('SOURCE:', maskUrl(sourceUrl));
  console.log('TARGET:', maskUrl(targetUrl));
  console.log('');

  const source = new PrismaClient({ datasources: { db: { url: sourceUrl } } });
  const target = new PrismaClient({ datasources: { db: { url: targetUrl } } });

  try {
    const data = await exportFullDatabase(source);
    console.log('Exported:', summarizeExport(data));
    console.log('');
    await importFullDatabase(target, data);
  } finally {
    await source.$disconnect();
    await target.$disconnect();
  }
}

main().catch((e) => {
  console.error('❌ Sync failed:', e);
  process.exit(1);
});
