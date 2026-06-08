-- DropForeignKey
ALTER TABLE "public"."feedbacks" DROP CONSTRAINT "feedbacks_service_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."questions" DROP CONSTRAINT "questions_service_id_fkey";

-- AlterTable
ALTER TABLE "feedbacks" ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "service_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "questions" ADD COLUMN     "category" TEXT,
ALTER COLUMN "service_id" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "questions_category_idx" ON "questions"("category");

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("service_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("service_id") ON DELETE SET NULL ON UPDATE CASCADE;
