-- AlterTable
ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "admin_comment" TEXT;
ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3);
UPDATE "appointments" SET "updated_at" = COALESCE("created_at", CURRENT_TIMESTAMP) WHERE "updated_at" IS NULL;
ALTER TABLE "appointments" ALTER COLUMN "updated_at" SET NOT NULL;
ALTER TABLE "appointments" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "appointments_status_idx" ON "appointments"("status");
