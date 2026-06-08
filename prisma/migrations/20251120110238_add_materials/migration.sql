-- CreateTable
CREATE TABLE "materials" (
    "material_id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "year" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "materials_pkey" PRIMARY KEY ("material_id")
);

-- CreateIndex
CREATE INDEX "materials_year_idx" ON "materials"("year");

-- CreateIndex
CREATE INDEX "materials_is_active_idx" ON "materials"("is_active");
