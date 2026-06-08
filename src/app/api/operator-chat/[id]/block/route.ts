import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

// PATCH - Заблокировать/разблокировать пациента
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Await params for Next.js 14+
    const params = await context.params;

    // Читаем body в самом начале
    const body = await request.json();
    const { action } = body;

    if (action !== 'block' && action !== 'unblock') {
      return NextResponse.json(
        { error: "Неверное действие" },
        { status: 400 }
      );
    }

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
    const chatId = parseInt(params.id);

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

    // Получаем чат
    const chat = await prisma.operatorChat.findUnique({
      where: { id: chatId },
      select: { patient_id: true },
    });

    if (!chat) {
      return NextResponse.json(
        { error: "Чат не найден" },
        { status: 404 }
      );
    }

    // Блокируем/разблокируем пациента
    await prisma.patient.update({
      where: { id: chat.patient_id },
      data: { is_messages_blocked: action === 'block' },
    });

    // Если блокируем - удаляем все чаты пользователя
    if (action === 'block') {
      await prisma.operatorChat.deleteMany({
        where: { patient_id: chat.patient_id },
      });
    }

    return NextResponse.json({
      success: true,
      blocked: action === 'block'
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при блокировке/разблокировке" },
      { status: 500 }
    );
  }
}
