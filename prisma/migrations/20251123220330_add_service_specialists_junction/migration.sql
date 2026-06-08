/*
  Warnings:

  - You are about to drop the column `specialists_id` on the `services` table. All the data in the column will be lost.
  - The `conferences` column on the `specialists` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropForeignKey
ALTER TABLE "public"."services" DROP CONSTRAINT "services_specialists_id_fkey";

-- DropIndex
DROP INDEX "public"."services_specialists_id_idx";

-- AlterTable
ALTER TABLE "services" DROP COLUMN "specialists_id";

-- AlterTable
ALTER TABLE "specialists" DROP COLUMN "conferences",
ADD COLUMN     "conferences" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "service_specialists" (
    "service_id" INTEGER NOT NULL,
    "specialist_id" INTEGER NOT NULL,

    CONSTRAINT "service_specialists_pkey" PRIMARY KEY ("service_id","specialist_id")
);

-- AddForeignKey
ALTER TABLE "service_specialists" ADD CONSTRAINT "service_specialists_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("service_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_specialists" ADD CONSTRAINT "service_specialists_specialist_id_fkey" FOREIGN KEY ("specialist_id") REFERENCES "specialists"("specialists_id") ON DELETE CASCADE ON UPDATE CASCADE;
