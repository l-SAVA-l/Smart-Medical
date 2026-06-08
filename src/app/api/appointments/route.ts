import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import {
  DEFAULT_DURATION_MINUTES,
  findConflictingAppointment,
  formatAppointmentForClient,
  specialistProvidesService,
  validateScheduledInFuture,
  validateWorkingHours,
} from "@/lib/appointments";
import { notifyAppointmentChange } from "@/lib/appointmentEvents";

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    if (!token?.id) {
      return NextResponse.json({ error: "Войдите в аккаунт" }, { status: 401 });
    }
    const patientId = parseInt(token.id as string);

    const appointments = await prisma.appointment.findMany({
      where: { patient_id: patientId },
      include: {
        specialist: true,
        service: { select: { id: true, title: true } },
      },
      orderBy: { scheduled_at: "desc" },
    });

    const list = appointments.map((a) =>
      formatAppointmentForClient({
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
      })
    );

    return NextResponse.json({ appointments: list }, { status: 200 });
  } catch (error) {
    console.error("Appointments GET error:", error);
    return NextResponse.json({ error: "Ошибка загрузки записей" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    if (!token?.id) {
      return NextResponse.json({ error: "Войдите в аккаунт" }, { status: 401 });
    }
    const patientId = parseInt(token.id as string);

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: { id: true },
    });
    if (!patient) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const { specialistId, serviceId, scheduledAt, durationMinutes = DEFAULT_DURATION_MINUTES, note } = body;

    if (!specialistId || !serviceId || !scheduledAt) {
      return NextResponse.json(
        { error: "Укажите врача, услугу и дату/время" },
        { status: 400 }
      );
    }

    const specialistIdNum = parseInt(specialistId, 10);
    const serviceIdNum = parseInt(serviceId, 10);
    const duration = parseInt(String(durationMinutes), 10) || DEFAULT_DURATION_MINUTES;

    const specialist = await prisma.specialist.findUnique({
      where: { id: specialistIdNum },
      select: { id: true },
    });
    if (!specialist) {
      return NextResponse.json({ error: "Врач не найден" }, { status: 400 });
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceIdNum },
      select: { id: true },
    });
    if (!service) {
      return NextResponse.json({ error: "Услуга не найдена" }, { status: 400 });
    }

    const linked = await specialistProvidesService(specialistIdNum, serviceIdNum);
    if (!linked) {
      return NextResponse.json(
        { error: "Выбранный врач не оказывает эту услугу" },
        { status: 400 }
      );
    }

    const scheduled = new Date(scheduledAt);
    if (Number.isNaN(scheduled.getTime())) {
      return NextResponse.json({ error: "Некорректная дата/время" }, { status: 400 });
    }

    const futureError = validateScheduledInFuture(scheduled);
    if (futureError) {
      return NextResponse.json({ error: futureError }, { status: 400 });
    }

    const hoursError = validateWorkingHours(scheduled);
    if (hoursError) {
      return NextResponse.json({ error: hoursError }, { status: 400 });
    }

    const conflict = await findConflictingAppointment(
      specialistIdNum,
      scheduled,
      duration
    );
    if (conflict) {
      return NextResponse.json(
        { error: "Это время уже занято. Выберите другой слот." },
        { status: 409 }
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        patient_id: patientId,
        specialist_id: specialistIdNum,
        service_id: serviceIdNum,
        scheduled_at: scheduled,
        duration_minutes: duration,
        status: "pending",
        note: typeof note === "string" && note.trim() ? note.trim() : null,
      },
    });

    notifyAppointmentChange({
      appointmentId: appointment.id,
      patientId,
      action: "created",
    });

    return NextResponse.json(
      { appointment: { id: appointment.id, scheduled_at: appointment.scheduled_at } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Appointments POST error:", error);
    return NextResponse.json({ error: "Ошибка создания записи" }, { status: 500 });
  }
}
