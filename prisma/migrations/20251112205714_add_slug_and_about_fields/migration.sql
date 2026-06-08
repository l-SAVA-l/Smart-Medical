-- Add slug column to categories (with default values for existing rows)
ALTER TABLE "categories" ADD COLUMN "slug" TEXT;

-- Update existing categories with slugs
UPDATE "categories" SET "slug" = 'dentistry' WHERE "name" = 'Стоматология';
UPDATE "categories" SET "slug" = 'cardiology' WHERE "name" = 'Кардиология';

-- Make slug NOT NULL and UNIQUE
ALTER TABLE "categories" ALTER COLUMN "slug" SET NOT NULL;
ALTER TABLE "categories" ADD CONSTRAINT "categories_slug_key" UNIQUE ("slug");

-- Create index on slug
CREATE INDEX "categories_slug_idx" ON "categories"("slug");

-- Add new columns to specialists table for about structure
ALTER TABLE "specialists" ADD COLUMN "specializations" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "specialists" ADD COLUMN "education" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "specialists" ADD COLUMN "work_examples" JSONB;

