import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

// GET - Получить список чатов (для админа/оператора)
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

    // Проверяем роль - должен быть OPERATOR, ADMIN или CHIEF_DOCTOR
    const user = await prisma.patient.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || !['OPERATOR', 'ADMIN', 'CHIEF_DOCTOR'].includes(user.role)) {
      return NextResponse.json(
        { error: "Нет доступа" },
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

    // Проверяем параметр unread_only
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread_only') === 'true';

    // Получаем список чатов
    const chats = await prisma.operatorChat.findMany({
      where: unreadOnly ? { has_unread_operator: true } : undefined,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar_url: true,
            is_messages_blocked: true,
          },
        },
        operator: {
          select: {
            id: true,
            name: true,
          },
        },
        messages: {
          orderBy: { created_at: 'desc' },
          take: 1, // Берем только последнее сообщение для превью
        },
      },
      orderBy: [
        { status: 'asc' }, // WAITING первыми
        { last_message_at: 'desc' },
        { created_at: 'desc' },
      ],
    });

    return NextResponse.json(
      { chats },
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
      { error: "Ошибка при получении чатов" },
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

// POST - Создать новый чат (для пациента)
export async function POST(request: NextRequest) {
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
    const { message } = await request.json();

    if (!message || message.trim().length < 3) {
      return NextResponse.json(
        { error: "Сообщение должно содержать минимум 3 символа" },
        {
          status: 400,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        }
      );
    }

    // Проверяем, не заблокирован ли пользователь
    const user = await prisma.patient.findUnique({
      where: { id: userId },
      select: { is_messages_blocked: true },
    });

    if (user?.is_messages_blocked) {
      return NextResponse.json(
        { error: "Вы заблокированы и не можете отправлять сообщения" },
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

    // Проверяем, есть ли уже активный чат у пользователя
    const existingChat = await prisma.operatorChat.findFirst({
      where: {
        patient_id: userId,
        status: { in: ['WAITING', 'ACTIVE'] },
      },
    });

    if (existingChat) {
      return NextResponse.json(
        { error: "У вас уже есть активный чат с оператором", chatId: existingChat.id },
        {
          status: 400,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        }
      );
    }

    // Создаем новый чат и первое сообщение
    const chat = await prisma.operatorChat.create({
      data: {
        patient_id: userId,
        status: 'WAITING',
        last_message_at: new Date(),
        has_unread_operator: true,
        messages: {
          create: {
            sender_id: userId,
            sender_type: 'patient',
            content: message.trim(),
            is_read: false,
          },
        },
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar_url: true,
          },
        },
        messages: true,
      },
    });

    return NextResponse.json(
      { chat },
      {
        status: 201,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при создании чата" },
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
