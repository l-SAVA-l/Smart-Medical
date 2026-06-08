import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

// GET - Получить одно письмо
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
        { status: 401 }
      );
    }

    const userId = parseInt(token.id as string);

    // Проверяем роль
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

    const { id } = await params;
    const letterId = parseInt(id);

    const letter = await prisma.letter.findUnique({
      where: { id: letterId },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar_url: true,
          },
        },
        messages: {
          orderBy: { created_at: 'asc' },
        },
      },
    });

    if (!letter) {
      return NextResponse.json(
        { error: "Письмо не найдено" },
        { status: 404 }
      );
    }

    // Отмечаем как прочитанное и сбрасываем флаг нового сообщения
    await prisma.$transaction([
      prisma.letter.update({
        where: { id: letterId },
        data: {
          is_read: true,
          has_new_patient_message: false,
        },
      }),
      prisma.letterMessage.updateMany({
        where: {
          letter_id: letterId,
          sender_type: 'patient',
          is_read: false,
        },
        data: { is_read: true },
      }),
    ]);

    return NextResponse.json(letter);
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при получении письма" },
      { status: 500 }
    );
  }
}

// PUT - Ответить на письмо (отправить сообщение в переписку)
export async function PUT(
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

    const userId = parseInt(token.id as string);

    // Проверяем роль - только главный врач может отвечать
    const user = await prisma.patient.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || user.role !== "CHIEF_DOCTOR") {
      return NextResponse.json(
        { error: "Только главный врач может отвечать на письма" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const letterId = parseInt(id);
    const { reply } = await request.json();

    if (!reply) {
      return NextResponse.json(
        { error: "Введите текст ответа" },
        { status: 400 }
      );
    }

    // Проверяем, есть ли уже ответ в письме
    const existingLetter = await prisma.letter.findUnique({
      where: { id: letterId },
    });

    if (!existingLetter) {
      return NextResponse.json(
        { error: "Письмо не найдено" },
        { status: 404 }
      );
    }

    const isFirstReply = !existingLetter.reply;
    let message = null;

    // Создаём LetterMessage только для последующих ответов (не для первого)
    // Первый ответ хранится в letter.reply
    if (!isFirstReply) {
      message = await prisma.letterMessage.create({
        data: {
          letter_id: letterId,
          sender_type: 'chief_doctor',
          content: reply,
          is_read: false,
        },
      });
    }

    // Обновляем письмо
    const letter = await prisma.letter.update({
      where: { id: letterId },
      data: {
        // Первый ответ сохраняем в reply
        reply: isFirstReply ? reply : existingLetter.reply,
        replied_at: isFirstReply ? new Date() : existingLetter.replied_at,
        is_read: true,
        // Сбрасываем is_reply_read только для первого ответа
        // Для последующих ответов оставляем как есть (не изменяем)
        ...(isFirstReply && { is_reply_read: false }),
        has_new_patient_message: false, // Сбрасываем флаг нового сообщения от пациента
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
        messages: {
          orderBy: { created_at: 'asc' },
        },
      },
    });

    return NextResponse.json({ ...letter, newMessage: message });
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при отправке ответа" },
      { status: 500 }
    );
  }
}

// DELETE - Удалить письмо
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
        { status: 401 }
      );
    }

    const userId = parseInt(token.id as string);

    // Проверяем роль
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

    const { id } = await params;
    const letterId = parseInt(id);

    await prisma.letter.delete({
      where: { id: letterId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при удалении письма" },
      { status: 500 }
    );
  }
}
