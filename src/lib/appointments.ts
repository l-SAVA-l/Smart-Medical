import { prisma } from "@/lib/prisma";

export const APPOINTMENT_STATUSES = [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
  "no_show",
] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

/** Статусы, при которых слот занят */
export const OCCUPYING_STATUSES: AppointmentStatus[] = [
  "pending",
  "confirmed",
  "completed",
  "no_show",
];

export const DEFAULT_DURATION_MINUTES = 30;
export const WORK_START_HOUR = 8;
export const WORK_END_HOUR = 20;
export const SLOT_STEP_MINUTES = 30;

export function getAppointmentEnd(scheduledAt: Date, durationMinutes: number): Date {
  return new Date(scheduledAt.getTime() + durationMinutes * 60_000);
}

export function rangesOverlap(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date
): boolean {
  return startA < endB && startB < endA;
}

export async function specialistProvidesService(
  specialistId: number,
  serviceId: number
): Promise<boolean> {
  const link = await prisma.serviceSpecialist.findUnique({
    where: {
      service_id_specialist_id: {
        service_id: serviceId,
        specialist_id: specialistId,
      },
    },
  });
  return Boolean(link);
}

export async function findConflictingAppointment(
  specialistId: number,
  scheduledAt: Date,
  durationMinutes: number,
  excludeAppointmentId?: number
) {
  const end = getAppointmentEnd(scheduledAt, durationMinutes);

  const existing = await prisma.appointment.findMany({
    where: {
      specialist_id: specialistId,
      status: { in: OCCUPYING_STATUSES },
      ...(excludeAppointmentId ? { id: { not: excludeAppointmentId } } : {}),
    },
    select: {
      id: true,
      scheduled_at: true,
      duration_minutes: true,
    },
  });

  return existing.find((apt) => {
    const aptEnd = getAppointmentEnd(apt.scheduled_at, apt.duration_minutes);
    return rangesOverlap(scheduledAt, end, apt.scheduled_at, aptEnd);
  }) ?? null;
}

export function validateScheduledInFuture(scheduledAt: Date): string | null {
  const now = new Date();
  if (scheduledAt.getTime() <= now.getTime()) {
    return "Запись возможна только на будущее время";
  }
  return null;
}

export function validateWorkingHours(scheduledAt: Date): string | null {
  const hours = scheduledAt.getHours();
  const minutes = scheduledAt.getMinutes();
  if (hours < WORK_START_HOUR || hours >= WORK_END_HOUR) {
    return `Приём с ${WORK_START_HOUR}:00 до ${WORK_END_HOUR}:00`;
  }
  if (minutes % SLOT_STEP_MINUTES !== 0) {
    return `Время должно быть кратно ${SLOT_STEP_MINUTES} минутам`;
  }
  const end = getAppointmentEnd(scheduledAt, DEFAULT_DURATION_MINUTES);
  if (end.getHours() > WORK_END_HOUR || (end.getHours() === WORK_END_HOUR && end.getMinutes() > 0)) {
    return "Приём не может заканчиваться после рабочего времени";
  }
  return null;
}

export function generateDaySlots(dateStr: string): string[] {
  const [y, m, d] = dateStr.split("-").map(Number);
  const slots: string[] = [];
  for (let hour = WORK_START_HOUR; hour < WORK_END_HOUR; hour++) {
    for (let min = 0; min < 60; min += SLOT_STEP_MINUTES) {
      const dt = new Date(y, m - 1, d, hour, min, 0, 0);
      const end = getAppointmentEnd(dt, DEFAULT_DURATION_MINUTES);
      if (end.getHours() > WORK_END_HOUR || (end.getHours() === WORK_END_HOUR && end.getMinutes() > 0)) {
        continue;
      }
      slots.push(
        `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`
      );
    }
  }
  return slots;
}

export function formatAppointmentForClient(a: {
  id: number;
  scheduled_at: Date;
  duration_minutes: number;
  status: string;
  note: string | null;
  admin_comment: string | null;
  specialist: { id: number; name: string; specialization: string };
  service: { id: number; title: string } | null;
}) {
  return {
    id: a.id,
    scheduled_at: a.scheduled_at,
    duration_minutes: a.duration_minutes,
    status: a.status,
    note: a.note,
    admin_comment: a.admin_comment,
    specialist: {
      id: a.specialist.id,
      name: a.specialist.name,
      specialization: a.specialist.specialization,
    },
    service: a.service,
  };
}

export const STATUS_LABELS: Record<string, string> = {
  pending: "Ожидает подтверждения",
  confirmed: "Подтверждена",
  cancelled: "Отменена",
  completed: "Завершена",
  no_show: "Не явился",
};

export function canPatientCancel(status: string): boolean {
  return status === "pending" || status === "confirmed";
}
