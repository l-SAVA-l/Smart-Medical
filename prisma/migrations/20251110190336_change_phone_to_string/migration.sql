-- AlterTable: Change phone column from INTEGER to TEXT
-- Using CAST to convert existing integer values to text
ALTER TABLE "patients" ALTER COLUMN "phone" TYPE TEXT USING phone::text;
