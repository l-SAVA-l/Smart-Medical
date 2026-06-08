-- AlterTable
ALTER TABLE "questions" ADD COLUMN     "faq_category_id" INTEGER;

-- CreateTable
CREATE TABLE "faq_categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "faq_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "faq_categories_slug_key" ON "faq_categories"("slug");

-- CreateIndex
CREATE INDEX "faq_categories_slug_idx" ON "faq_categories"("slug");

-- CreateIndex
CREATE INDEX "faq_categories_order_idx" ON "faq_categories"("order");

-- CreateIndex
CREATE INDEX "questions_faq_category_id_idx" ON "questions"("faq_category_id");

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_faq_category_id_fkey" FOREIGN KEY ("faq_category_id") REFERENCES "faq_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
