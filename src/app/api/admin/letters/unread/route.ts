import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

// GET - Получить непрочитанные письма для главного врача
export async function GET(request: NextRequest) {
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

    const userId = parseInt(token.id as string);

    // Проверяем роль пользователя
    const user = await prisma.patient.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || user.role !== "CHIEF_DOCTOR") {
      return NextResponse.json(
        { error: "Нет доступа" },
        { status: 403 }
      );
    }

    // Получаем непрочитанные письма (новые письма или письма с новыми сообщениями от пациентов)
    const unreadLetters = await prisma.letter.findMany({
      where: {
        OR: [
          { is_read: false },
          { has_new_patient_message: true },
        ],
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            avatar_url: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    // Считаем общее количество непрочитанных
    const count = unreadLetters.length;

    return NextResponse.json({
      count,
      letters: unreadLetters,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при получении писем" },
      { status: 500 }
    );
  }
}
