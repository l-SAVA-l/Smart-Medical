import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

// POST - Заблокировать/разблокировать пользователя от отправки писем
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    if (!token || !token.id) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      );
    }

    const chiefDoctorId = parseInt(token.id as string);

    // Проверяем роль - только главный врач
    const chiefDoctor = await prisma.patient.findUnique({
      where: { id: chiefDoctorId },
      select: { role: true },
    });

    if (!chiefDoctor || chiefDoctor.role !== "CHIEF_DOCTOR") {
      return NextResponse.json(
        { error: "Нет доступа" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const userId = parseInt(id);
    const { blocked } = await request.json();

    // Получаем пользователя
    const user = await prisma.patient.findUnique({
      where: { id: userId },
      select: { role: true, name: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      );
    }

    // Нельзя заблокировать главного врача или админа
    if (user.role === "CHIEF_DOCTOR" || user.role === "ADMIN") {
      return NextResponse.json(
        { error: "Нельзя заблокировать администратора" },
        { status: 403 }
      );
    }

    // Обновляем статус блокировки
    const updatedUser = await prisma.patient.update({
      where: { id: userId },
      data: { is_messages_blocked: blocked },
      select: {
        id: true,
        name: true,
        is_messages_blocked: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: blocked
        ? `Пользователь "${user.name}" заблокирован`
        : `Пользователь "${user.name}" разблокирован`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при изменении статуса блокировки" },
      { status: 500 }
    );
  }
}
