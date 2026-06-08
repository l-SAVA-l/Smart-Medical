-- CreateTable: меню категорий услуг (для загрузки услуг и специалистов из БД)
CREATE TABLE IF NOT EXISTS "service_categories" (
    "service_category_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "description" TEXT,
    "parent_id" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_categories_pkey" PRIMARY KEY ("service_category_id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "service_categories_slug_key" ON "service_categories"("slug");
CREATE INDEX IF NOT EXISTS "service_categories_parent_id_idx" ON "service_categories"("parent_id");
CREATE INDEX IF NOT EXISTS "service_categories_slug_idx" ON "service_categories"("slug");
CREATE INDEX IF NOT EXISTS "service_categories_is_active_idx" ON "service_categories"("is_active");
CREATE INDEX IF NOT EXISTS "service_categories_order_idx" ON "service_categories"("order");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'service_categories_parent_id_fkey'
  ) THEN
    ALTER TABLE "service_categories" ADD CONSTRAINT "service_categories_parent_id_fkey"
      FOREIGN KEY ("parent_id") REFERENCES "service_categories"("service_category_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Add service_category_id to services (nullable)
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "service_category_id" INTEGER;
CREATE INDEX IF NOT EXISTS "services_service_category_id_idx" ON "services"("service_category_id");
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'services_service_category_id_fkey') THEN
    ALTER TABLE "services" ADD CONSTRAINT "services_service_category_id_fkey"
      FOREIGN KEY ("service_category_id") REFERENCES "service_categories"("service_category_id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Add service_category_id to specialists (nullable)
ALTER TABLE "specialists" ADD COLUMN IF NOT EXISTS "service_category_id" INTEGER;
CREATE INDEX IF NOT EXISTS "specialists_service_category_id_idx" ON "specialists"("service_category_id");
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'specialists_service_category_id_fkey') THEN
    ALTER TABLE "specialists" ADD CONSTRAINT "specialists_service_category_id_fkey"
      FOREIGN KEY ("service_category_id") REFERENCES "service_categories"("service_category_id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
