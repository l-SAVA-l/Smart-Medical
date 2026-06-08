import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

// GET - Получить количество непрочитанных чатов для операторов
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

    // Проверяем роль - должен быть OPERATOR, ADMIN или CHIEF_DOCTOR
    const user = await prisma.patient.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || !['OPERATOR', 'ADMIN', 'CHIEF_DOCTOR'].includes(user.role)) {
      return NextResponse.json(
        { error: "Нет доступа" },
        { status: 403 }
      );
    }

    // Считаем количество чатов с непрочитанными сообщениями для операторов
    const unreadCount = await prisma.operatorChat.count({
      where: {
        has_unread_operator: true,
      },
    });

    return NextResponse.json({ count: unreadCount });
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при получении количества непрочитанных" },
      { status: 500 }
    );
  }
}
