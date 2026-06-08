import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

// GET - Получить активный чат текущего пациента
export async function GET(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    if (!token || !token.id) {
      return NextResponse.json(
        { error: "Не авторизован" },
        {
          status: 401,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        }
      );
    }

    const userId = parseInt(token.id as string);

    // Проверяем, не заблокирован ли пользователь
    const user = await prisma.patient.findUnique({
      where: { id: userId },
      select: { is_messages_blocked: true },
    });

    if (user?.is_messages_blocked) {
      return NextResponse.json(
        { error: "Вы заблокированы и не можете использовать чат" },
        {
          status: 403,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        }
      );
    }

    // Ищем активный чат пользователя
    const chat = await prisma.operatorChat.findFirst({
      where: {
        patient_id: userId,
        status: { in: ['WAITING', 'ACTIVE'] },
      },
      include: {
        operator: {
          select: {
            id: true,
            name: true,
          },
        },
        messages: {
          orderBy: { created_at: 'asc' },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                avatar_url: true,
              },
            },
          },
        },
      },
    });

    if (!chat) {
      return NextResponse.json(
        { chat: null },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        }
      );
    }

    // Отмечаем сообщения оператора как прочитанные
    await prisma.operatorChatMessage.updateMany({
      where: {
        chat_id: chat.id,
        sender_type: 'operator',
        is_read: false,
      },
      data: { is_read: true },
    });

    // Обновляем флаг непрочитанных для пациента
    await prisma.operatorChat.update({
      where: { id: chat.id },
      data: { has_unread_patient: false },
    });

    return NextResponse.json(
      { chat },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при получении чата" },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );
  }
}
