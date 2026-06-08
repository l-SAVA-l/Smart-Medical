import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdmin } from "@/lib/adminAuth";
import { APPOINTMENT_STATUSES } from "@/lib/appointments";

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await checkAdmin(request);
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: adminCheck.error }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";

    const where: Record<string, unknown> = {};

    if (status !== "all" && APPOINTMENT_STATUSES.includes(status as typeof APPOINTMENT_STATUSES[number])) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { note: { contains: search, mode: "insensitive" } },
        { admin_comment: { contains: search, mode: "insensitive" } },
        {
          patient: {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
            ],
          },
        },
        {
          specialist: {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { specialization: { contains: search, mode: "insensitive" } },
            ],
          },
        },
        {
          service: {
            title: { contains: search, mode: "insensitive" },
          },
        },
      ];
    }

    const totalCount = await prisma.appointment.count({ where });

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        specialist: {
          select: { id: true, name: true, specialization: true },
        },
        service: { select: { id: true, title: true } },
      },
      orderBy: { scheduled_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const statusCounts = await prisma.appointment.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    const countsByStatus = Object.fromEntries(
      statusCounts.map((s) => [s.status, s._count.status])
    );

    return NextResponse.json({
      data: appointments.map((a) => ({
        id: a.id,
        scheduled_at: a.scheduled_at,
        duration_minutes: a.duration_minutes,
        status: a.status,
        note: a.note,
        admin_comment: a.admin_comment,
        created_at: a.created_at,
        updated_at: a.updated_at,
        patient: a.patient,
        specialist: a.specialist,
        service: a.service,
      })),
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      countsByStatus,
    });
  } catch (error) {
    console.error("Admin appointments GET error:", error);
    return NextResponse.json({ error: "Ошибка загрузки записей" }, { status: 500 });
  }
}
