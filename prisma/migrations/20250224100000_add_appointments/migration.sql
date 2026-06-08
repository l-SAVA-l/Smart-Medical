-- CreateTable: записи на приём
CREATE TABLE "appointments" (
    "appointment_id" SERIAL NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "specialists_id" INTEGER NOT NULL,
    "service_id" INTEGER,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "duration_minutes" INTEGER NOT NULL DEFAULT 30,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("appointment_id")
);

CREATE INDEX "appointments_patient_id_idx" ON "appointments"("patient_id");
CREATE INDEX "appointments_specialists_id_idx" ON "appointments"("specialists_id");
CREATE INDEX "appointments_scheduled_at_idx" ON "appointments"("scheduled_at");

ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_fkey"
  FOREIGN KEY ("patient_id") REFERENCES "patients"("patient_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_specialists_id_fkey"
  FOREIGN KEY ("specialists_id") REFERENCES "specialists"("specialists_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_service_id_fkey"
  FOREIGN KEY ("service_id") REFERENCES "services"("service_id") ON DELETE SET NULL ON UPDATE CASCADE;
