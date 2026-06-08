-- Sync schema drift: chat/letters tables, role enum values, patient block flag

-- CreateEnum
CREATE TYPE "ChatStatus" AS ENUM ('WAITING', 'ACTIVE', 'CLOSED');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'CHIEF_DOCTOR';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'OPERATOR';

-- DropForeignKey
ALTER TABLE "questions" DROP CONSTRAINT IF EXISTS "questions_faq_category_id_fkey";

-- DropForeignKey
ALTER TABLE "services" DROP CONSTRAINT IF EXISTS "services_service_category_id_fkey";

-- DropForeignKey
ALTER TABLE "specialists" DROP CONSTRAINT IF EXISTS "specialists_service_category_id_fkey";

-- DropIndex
DROP INDEX IF EXISTS "questions_faq_category_id_idx";

-- AlterTable
ALTER TABLE "appointments" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "patients" ADD COLUMN IF NOT EXISTS "is_messages_blocked" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "questions" DROP COLUMN IF EXISTS "faq_category_id";
ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "question_category_id" INTEGER;

-- AlterTable
ALTER TABLE "service_categories" ALTER COLUMN "updated_at" DROP DEFAULT;

-- DropTable
DROP TABLE IF EXISTS "faq_categories";

-- CreateTable
CREATE TABLE IF NOT EXISTS "question_categories" (
    "question_category_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_categories_pkey" PRIMARY KEY ("question_category_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "letters" (
    "letter_id" SERIAL NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reply" TEXT,
    "replied_at" TIMESTAMP(3),
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "is_reply_read" BOOLEAN NOT NULL DEFAULT false,
    "has_new_patient_message" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "letters_pkey" PRIMARY KEY ("letter_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "letter_messages" (
    "message_id" SERIAL NOT NULL,
    "letter_id" INTEGER NOT NULL,
    "sender_type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_read" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "letter_messages_pkey" PRIMARY KEY ("message_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "operator_chats" (
    "chat_id" SERIAL NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "operator_id" INTEGER,
    "status" "ChatStatus" NOT NULL DEFAULT 'WAITING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_message_at" TIMESTAMP(3),
    "has_unread_operator" BOOLEAN NOT NULL DEFAULT true,
    "has_unread_patient" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "operator_chats_pkey" PRIMARY KEY ("chat_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "operator_chat_messages" (
    "message_id" SERIAL NOT NULL,
    "chat_id" INTEGER NOT NULL,
    "sender_id" INTEGER NOT NULL,
    "sender_type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_read" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "operator_chat_messages_pkey" PRIMARY KEY ("message_id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "question_categories_slug_key" ON "question_categories"("slug");
CREATE INDEX IF NOT EXISTS "question_categories_slug_idx" ON "question_categories"("slug");
CREATE INDEX IF NOT EXISTS "question_categories_is_active_idx" ON "question_categories"("is_active");
CREATE INDEX IF NOT EXISTS "question_categories_order_idx" ON "question_categories"("order");
CREATE INDEX IF NOT EXISTS "letters_patient_id_idx" ON "letters"("patient_id");
CREATE INDEX IF NOT EXISTS "letters_is_read_idx" ON "letters"("is_read");
CREATE INDEX IF NOT EXISTS "letters_is_reply_read_idx" ON "letters"("is_reply_read");
CREATE INDEX IF NOT EXISTS "letters_has_new_patient_message_idx" ON "letters"("has_new_patient_message");
CREATE INDEX IF NOT EXISTS "letter_messages_letter_id_idx" ON "letter_messages"("letter_id");
CREATE INDEX IF NOT EXISTS "letter_messages_is_read_idx" ON "letter_messages"("is_read");
CREATE INDEX IF NOT EXISTS "operator_chats_patient_id_idx" ON "operator_chats"("patient_id");
CREATE INDEX IF NOT EXISTS "operator_chats_operator_id_idx" ON "operator_chats"("operator_id");
CREATE INDEX IF NOT EXISTS "operator_chats_status_idx" ON "operator_chats"("status");
CREATE INDEX IF NOT EXISTS "operator_chats_has_unread_operator_idx" ON "operator_chats"("has_unread_operator");
CREATE INDEX IF NOT EXISTS "operator_chat_messages_chat_id_idx" ON "operator_chat_messages"("chat_id");
CREATE INDEX IF NOT EXISTS "operator_chat_messages_sender_id_idx" ON "operator_chat_messages"("sender_id");
CREATE INDEX IF NOT EXISTS "operator_chat_messages_is_read_idx" ON "operator_chat_messages"("is_read");
CREATE INDEX IF NOT EXISTS "operator_chat_messages_created_at_idx" ON "operator_chat_messages"("created_at");
CREATE INDEX IF NOT EXISTS "questions_question_category_id_idx" ON "questions"("question_category_id");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'services_service_category_id_fkey') THEN
    ALTER TABLE "services" ADD CONSTRAINT "services_service_category_id_fkey"
      FOREIGN KEY ("service_category_id") REFERENCES "service_categories"("service_category_id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'specialists_service_category_id_fkey') THEN
    ALTER TABLE "specialists" ADD CONSTRAINT "specialists_service_category_id_fkey"
      FOREIGN KEY ("service_category_id") REFERENCES "service_categories"("service_category_id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'questions_question_category_id_fkey') THEN
    ALTER TABLE "questions" ADD CONSTRAINT "questions_question_category_id_fkey"
      FOREIGN KEY ("question_category_id") REFERENCES "question_categories"("question_category_id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'letters_patient_id_fkey') THEN
    ALTER TABLE "letters" ADD CONSTRAINT "letters_patient_id_fkey"
      FOREIGN KEY ("patient_id") REFERENCES "patients"("patient_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'letter_messages_letter_id_fkey') THEN
    ALTER TABLE "letter_messages" ADD CONSTRAINT "letter_messages_letter_id_fkey"
      FOREIGN KEY ("letter_id") REFERENCES "letters"("letter_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'operator_chats_patient_id_fkey') THEN
    ALTER TABLE "operator_chats" ADD CONSTRAINT "operator_chats_patient_id_fkey"
      FOREIGN KEY ("patient_id") REFERENCES "patients"("patient_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'operator_chats_operator_id_fkey') THEN
    ALTER TABLE "operator_chats" ADD CONSTRAINT "operator_chats_operator_id_fkey"
      FOREIGN KEY ("operator_id") REFERENCES "patients"("patient_id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'operator_chat_messages_chat_id_fkey') THEN
    ALTER TABLE "operator_chat_messages" ADD CONSTRAINT "operator_chat_messages_chat_id_fkey"
      FOREIGN KEY ("chat_id") REFERENCES "operator_chats"("chat_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'operator_chat_messages_sender_id_fkey') THEN
    ALTER TABLE "operator_chat_messages" ADD CONSTRAINT "operator_chat_messages_sender_id_fkey"
      FOREIGN KEY ("sender_id") REFERENCES "patients"("patient_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
