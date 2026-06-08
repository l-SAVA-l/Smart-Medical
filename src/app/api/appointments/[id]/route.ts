import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import { canPatientCancel } from "@/lib/appointments";
import { notifyAppointmentChange } from "@/lib/appointmentEvents";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    if (!token?.id) {
      return NextResponse.json({ error: "Войдите в аккаунт" }, { status: 401 });
    }
    const patientId = parseInt(token.id as string);
    const { id } = await params;
    const appointmentId = parseInt(id, 10);
    if (Number.isNaN(appointmentId)) {
      return NextResponse.json({ error: "Неверный идентификатор записи" }, { status: 400 });
    }

    const existing = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: { patient_id: true, status: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Запись не найдена" }, { status: 404 });
    }
    if (existing.patient_id !== patientId) {
      return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const { status: newStatus } = body;

    if (newStatus !== "cancelled") {
      return NextResponse.json({ error: "Можно только отменить запись" }, { status: 400 });
    }

    if (!canPatientCancel(existing.status)) {
      return NextResponse.json(
        { error: "Эту запись нельзя отменить" },
        { status: 400 }
      );
    }

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: "cancelled" },
    });

    notifyAppointmentChange({
      appointmentId,
      patientId,
      action: "updated",
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Appointment PATCH error:", error);
    return NextResponse.json({ error: "Ошибка обновления записи" }, { status: 500 });
  }
}
