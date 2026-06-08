import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdmin } from "@/lib/adminAuth";
import { APPOINTMENT_STATUSES } from "@/lib/appointments";
import { notifyAppointmentChange } from "@/lib/appointmentEvents";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminCheck = await checkAdmin(request);
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: adminCheck.error }, { status: 403 });
    }

    const { id } = await params;
    const appointmentId = parseInt(id, 10);
    if (Number.isNaN(appointmentId)) {
      return NextResponse.json({ error: "Неверный ID" }, { status: 400 });
    }

    const existing = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Запись не найдена" }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const updateData: Record<string, unknown> = {};

    if (body.status !== undefined) {
      if (!APPOINTMENT_STATUSES.includes(body.status)) {
        return NextResponse.json({ error: "Недопустимый статус" }, { status: 400 });
      }
      updateData.status = body.status;
    }

    if (body.admin_comment !== undefined) {
      updateData.admin_comment =
        typeof body.admin_comment === "string" && body.admin_comment.trim()
          ? body.admin_comment.trim()
          : null;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "Нет данных для обновления" }, { status: 400 });
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: updateData,
      include: {
        patient: {
          select: { id: true, name: true, email: true, phone: true },
        },
        specialist: {
          select: { id: true, name: true, specialization: true },
        },
        service: { select: { id: true, title: true } },
      },
    });

    notifyAppointmentChange({
      appointmentId: updated.id,
      patientId: updated.patient_id,
      action: "updated",
    });

    return NextResponse.json({ appointment: updated });
  } catch (error) {
    console.error("Admin appointment PATCH error:", error);
    return NextResponse.json({ error: "Ошибка обновления записи" }, { status: 500 });
  }
}
