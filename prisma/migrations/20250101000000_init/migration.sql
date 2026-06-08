-- CreateTable
CREATE TABLE "services" (
    "service_id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "video_url" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "specialists_id" INTEGER NOT NULL,
    "image_url" TEXT NOT NULL,
    "image_url_1" TEXT NOT NULL,
    "image_url_2" TEXT NOT NULL,
    "image_url_3" TEXT NOT NULL,
    "image_url_4" TEXT,
    "questions_id" INTEGER NOT NULL,
    "reviews_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("service_id")
);

-- CreateTable
CREATE TABLE "categories" (
    "category_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "specialists" (
    "specialists_id" SERIAL NOT NULL,
    "categori_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "specialization" TEXT NOT NULL,
    "qualification" TEXT NOT NULL,
    "experience" INTEGER NOT NULL,
    "grade" INTEGER NOT NULL,
    "image_url" TEXT NOT NULL,
    "activity_area" TEXT,
    "education_details" TEXT,
    "conferences" TEXT,

    CONSTRAINT "specialists_pkey" PRIMARY KEY ("specialists_id")
);

-- CreateTable
CREATE TABLE "questions" (
    "questions_id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT,
    "service_id" INTEGER NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("questions_id")
);

-- CreateTable
CREATE TABLE "feedbacks" (
    "reviews_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "grade" INTEGER NOT NULL,
    "image_url" TEXT NOT NULL,
    "service_id" INTEGER NOT NULL,

    CONSTRAINT "feedbacks_pkey" PRIMARY KEY ("reviews_id")
);

-- CreateTable
CREATE TABLE "partners" (
    "partners_id" SERIAL NOT NULL,
    "categori_id" INTEGER NOT NULL,
    "image_url" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "website_url" TEXT NOT NULL,

    CONSTRAINT "partners_pkey" PRIMARY KEY ("partners_id")
);

-- CreateTable
CREATE TABLE "vacancies" (
    "vacancies_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "payment" INTEGER NOT NULL,
    "experience" INTEGER NOT NULL,
    "requirements" TEXT NOT NULL,

    CONSTRAINT "vacancies_pkey" PRIMARY KEY ("vacancies_id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "contact_id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "map_geo" TEXT NOT NULL,
    "work_hours_main" TEXT NOT NULL,
    "work_hours_sunday" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "phone_number_sec" TEXT,
    "email" TEXT NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("contact_id")
);

-- CreateTable
CREATE TABLE "patients" (
    "patient_id" SERIAL NOT NULL,
    "login" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" INTEGER NOT NULL,
    "registration_date" DATE NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("patient_id")
);

-- CreateIndex
CREATE INDEX "services_category_id_idx" ON "services"("category_id");

-- CreateIndex
CREATE INDEX "services_specialists_id_idx" ON "services"("specialists_id");

-- CreateIndex
CREATE INDEX "specialists_categori_id_idx" ON "specialists"("categori_id");

-- CreateIndex
CREATE INDEX "questions_service_id_idx" ON "questions"("service_id");

-- CreateIndex
CREATE INDEX "feedbacks_service_id_idx" ON "feedbacks"("service_id");

-- CreateIndex
CREATE INDEX "partners_categori_id_idx" ON "partners"("categori_id");

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_specialists_id_fkey" FOREIGN KEY ("specialists_id") REFERENCES "specialists"("specialists_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specialists" ADD CONSTRAINT "specialists_categori_id_fkey" FOREIGN KEY ("categori_id") REFERENCES "categories"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("service_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("service_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partners" ADD CONSTRAINT "partners_categori_id_fkey" FOREIGN KEY ("categori_id") REFERENCES "categories"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;
