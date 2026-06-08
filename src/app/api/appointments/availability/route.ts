import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_DURATION_MINUTES,
  generateDaySlots,
  getAppointmentEnd,
  OCCUPYING_STATUSES,
} from "@/lib/appointments";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const specialistId = parseInt(searchParams.get("specialistId") || "", 10);
    const date = searchParams.get("date") || "";

    if (!specialistId || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: "Укажите specialistId и date (YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    const specialist = await prisma.specialist.findUnique({
      where: { id: specialistId },
      select: { id: true },
    });
    if (!specialist) {
      return NextResponse.json({ error: "Врач не найден" }, { status: 404 });
    }

    const [y, m, d] = date.split("-").map(Number);
    const dayStart = new Date(y, m - 1, d, 0, 0, 0, 0);
    const dayEnd = new Date(y, m - 1, d, 23, 59, 59, 999);

    const appointments = await prisma.appointment.findMany({
      where: {
        specialist_id: specialistId,
        status: { in: OCCUPYING_STATUSES },
        scheduled_at: { gte: dayStart, lte: dayEnd },
      },
      select: {
        scheduled_at: true,
        duration_minutes: true,
      },
    });

    const allSlots = generateDaySlots(date);
    const now = new Date();

    const bookedTimes = appointments.map((a) => {
      const end = getAppointmentEnd(a.scheduled_at, a.duration_minutes);
      return {
        start: a.scheduled_at.toISOString(),
        end: end.toISOString(),
      };
    });

    const availableSlots = allSlots.filter((time) => {
      const [hh, mm] = time.split(":").map(Number);
      const slotStart = new Date(y, m - 1, d, hh, mm, 0, 0);
      if (slotStart.getTime() <= now.getTime()) return false;

      const slotEnd = getAppointmentEnd(slotStart, DEFAULT_DURATION_MINUTES);
      const occupied = appointments.some((apt) => {
        const aptEnd = getAppointmentEnd(apt.scheduled_at, apt.duration_minutes);
        return slotStart < aptEnd && apt.scheduled_at < slotEnd;
      });
      return !occupied;
    });

    return NextResponse.json({
      date,
      specialistId,
      availableSlots,
      bookedTimes,
      workHours: { start: 8, end: 20, stepMinutes: 30 },
    });
  } catch (error) {
    console.error("Availability GET error:", error);
    return NextResponse.json({ error: "Ошибка загрузки слотов" }, { status: 500 });
  }
}
