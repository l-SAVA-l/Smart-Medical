import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

// Заголовки для предотвращения кэширования
const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

// GET - Получить чат с сообщениями
export async function GET(
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
        { status: 401, headers: NO_CACHE_HEADERS }
      );
    }

    const userId = parseInt(token.id as string);
    const { id } = await params;
    const chatId = parseInt(id);

    const user = await prisma.patient.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    const chat = await prisma.operatorChat.findUnique({
      where: { id: chatId },
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
        { error: "Чат не найден" },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }

    // Проверяем доступ: пациент может видеть только свой чат, операторы/админы - все
    if (user?.role === 'USER' && chat.patient_id !== userId) {
      return NextResponse.json(
        { error: "Нет доступа" },
        { status: 403, headers: NO_CACHE_HEADERS }
      );
    }

    // Помечаем сообщения как прочитанные
    if (user?.role && ['OPERATOR', 'ADMIN', 'CHIEF_DOCTOR'].includes(user.role)) {
      // Оператор читает - помечаем сообщения от пациента
      await prisma.$transaction([
        prisma.operatorChatMessage.updateMany({
          where: {
            chat_id: chatId,
            sender_type: 'patient',
            is_read: false,
          },
          data: { is_read: true },
        }),
        prisma.operatorChat.update({
          where: { id: chatId },
          data: { has_unread_operator: false },
        }),
      ]);
    } else {
      // Пациент читает - помечаем сообщения от оператора
      await prisma.$transaction([
        prisma.operatorChatMessage.updateMany({
          where: {
            chat_id: chatId,
            sender_type: 'operator',
            is_read: false,
          },
          data: { is_read: true },
        }),
        prisma.operatorChat.update({
          where: { id: chatId },
          data: { has_unread_patient: false },
        }),
      ]);
    }

    return NextResponse.json({ chat }, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при получении чата" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

// POST - Отправить сообщение в чат
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
        { status: 401, headers: NO_CACHE_HEADERS }
      );
    }

    const userId = parseInt(token.id as string);
    const { id } = await params;
    const chatId = parseInt(id);
    const { content } = await request.json();

    if (!content || content.trim().length < 1) {
      return NextResponse.json(
        { error: "Сообщение не может быть пустым" },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const user = await prisma.patient.findUnique({
      where: { id: userId },
      select: { role: true, is_messages_blocked: true },
    });

    if (user?.is_messages_blocked && user.role === 'USER') {
      return NextResponse.json(
        { error: "Вы заблокированы и не можете отправлять сообщения" },
        { status: 403, headers: NO_CACHE_HEADERS }
      );
    }

    const chat = await prisma.operatorChat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      return NextResponse.json(
        { error: "Чат не найден" },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }

    // Проверяем доступ
    if (user?.role === 'USER' && chat.patient_id !== userId) {
      return NextResponse.json(
        { error: "Нет доступа" },
        { status: 403, headers: NO_CACHE_HEADERS }
      );
    }

    const senderType = user?.role && ['OPERATOR', 'ADMIN', 'CHIEF_DOCTOR'].includes(user.role)
      ? 'operator'
      : 'patient';

    // Создаем сообщение
    const message = await prisma.operatorChatMessage.create({
      data: {
        chat_id: chatId,
        sender_id: userId,
        sender_type: senderType,
        content: content.trim(),
        is_read: false,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar_url: true,
          },
        },
      },
    });

    // Обновляем чат
    await prisma.operatorChat.update({
      where: { id: chatId },
      data: {
        last_message_at: new Date(),
        has_unread_operator: senderType === 'patient',
        has_unread_patient: senderType === 'operator',
      },
    });

    return NextResponse.json({ message }, { status: 201, headers: NO_CACHE_HEADERS });
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при отправке сообщения" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

// PATCH - Взять чат (для оператора) или изменить статус
export async function PATCH(
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
        { status: 401, headers: NO_CACHE_HEADERS }
      );
    }

    const userId = parseInt(token.id as string);
    const { id } = await params;
    const chatId = parseInt(id);
    const { action, status } = await request.json();

    const user = await prisma.patient.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || !['OPERATOR', 'ADMIN', 'CHIEF_DOCTOR'].includes(user.role)) {
      return NextResponse.json(
        { error: "Нет доступа" },
        { status: 403, headers: NO_CACHE_HEADERS }
      );
    }

    const chat = await prisma.operatorChat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      return NextResponse.json(
        { error: "Чат не найден" },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }

    let updatedChat;

    if (action === 'take') {
      // Взять чат
      updatedChat = await prisma.operatorChat.update({
        where: { id: chatId },
        data: {
          operator_id: userId,
          status: 'ACTIVE',
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
          operator: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    } else if (status) {
      // Изменить статус
      updatedChat = await prisma.operatorChat.update({
        where: { id: chatId },
        data: { status },
        include: {
          patient: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar_url: true,
            },
          },
          operator: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    } else {
      return NextResponse.json(
        { error: "Неверное действие" },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    return NextResponse.json({ chat: updatedChat }, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при обновлении чата" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

// DELETE - Удалить чат (для операторов/админов)
export async function DELETE(
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
        { status: 401, headers: NO_CACHE_HEADERS }
      );
    }

    const userId = parseInt(token.id as string);
    const { id } = await params;
    const chatId = parseInt(id);

    const user = await prisma.patient.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || !['OPERATOR', 'ADMIN', 'CHIEF_DOCTOR'].includes(user.role)) {
      return NextResponse.json(
        { error: "Нет доступа" },
        { status: 403, headers: NO_CACHE_HEADERS }
      );
    }

    const chat = await prisma.operatorChat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      return NextResponse.json(
        { error: "Чат не найден" },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }

    // Удаляем чат (все сообщения удалятся каскадно)
    await prisma.operatorChat.delete({
      where: { id: chatId },
    });

    return NextResponse.json(
      { success: true, message: "Чат удален" },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при удалении чата" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
