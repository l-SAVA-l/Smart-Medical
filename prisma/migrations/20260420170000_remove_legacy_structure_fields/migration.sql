-- Enforce new required relations
ALTER TABLE "services"
ALTER COLUMN "service_category_id" SET NOT NULL;

ALTER TABLE "specialists"
ALTER COLUMN "service_category_id" SET NOT NULL;

-- Remove legacy columns no longer used by the application
ALTER TABLE "questions"
DROP COLUMN "category";

ALTER TABLE "services"
DROP COLUMN "category_id";

ALTER TABLE "specialists"
DROP COLUMN "categori_id";
