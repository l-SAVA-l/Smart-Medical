import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

// GET - Получить одно письмо с сообщениями
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
    const { id } = await params;
    const letterId = parseInt(id);

    const letter = await prisma.letter.findFirst({
      where: {
        id: letterId,
        patient_id: userId
      },
      include: {
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

    // Отмечаем сообщения от главврача как прочитанные
    await prisma.$transaction([
      prisma.letter.update({
        where: { id: letterId },
        data: { is_reply_read: true },
      }),
      prisma.letterMessage.updateMany({
        where: {
          letter_id: letterId,
          sender_type: 'chief_doctor',
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

// PATCH - Отметить ответ как прочитанный
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
        { status: 401 }
      );
    }

    const userId = parseInt(token.id as string);
    const { id } = await params;
    const letterId = parseInt(id);

    // Проверяем, что письмо принадлежит пользователю
    const letter = await prisma.letter.findFirst({
      where: {
        id: letterId,
        patient_id: userId
      },
    });

    if (!letter) {
      return NextResponse.json(
        { error: "Письмо не найдено" },
        { status: 404 }
      );
    }

    // Отмечаем ответ как прочитанный и все сообщения от главврача
    await prisma.$transaction([
      prisma.letter.update({
        where: { id: letterId },
        data: { is_reply_read: true },
      }),
      prisma.letterMessage.updateMany({
        where: {
          letter_id: letterId,
          sender_type: 'chief_doctor',
          is_read: false,
        },
        data: { is_read: true },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при обновлении письма" },
      { status: 500 }
    );
  }
}

// POST - Отправить новое сообщение в переписке (пациент отвечает главврачу)
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

    const userId = parseInt(token.id as string);
    const { id } = await params;
    const letterId = parseInt(id);
    const { content } = await request.json();

    // Проверяем, не заблокирован ли пользователь
    const user = await prisma.patient.findUnique({
      where: { id: userId },
      select: { is_messages_blocked: true },
    });

    if (user?.is_messages_blocked) {
      return NextResponse.json(
        { error: "Вы заблокированы и не можете отправлять сообщения" },
        { status: 403 }
      );
    }

    if (!content || content.trim().length < 10) {
      return NextResponse.json(
        { error: "Сообщение должно содержать минимум 10 символов" },
        { status: 400 }
      );
    }

    // Проверяем, что письмо принадлежит пользователю и на него уже есть ответ
    const letter = await prisma.letter.findFirst({
      where: {
        id: letterId,
        patient_id: userId,
      },
    });

    if (!letter) {
      return NextResponse.json(
        { error: "Письмо не найдено" },
        { status: 404 }
      );
    }

    // Пациент может отвечать только если главврач уже ответил
    if (!letter.reply && !letter.replied_at) {
      return NextResponse.json(
        { error: "Вы можете ответить только после получения ответа от главного врача" },
        { status: 400 }
      );
    }

    // Создаём новое сообщение
    const message = await prisma.letterMessage.create({
      data: {
        letter_id: letterId,
        sender_type: 'patient',
        content: content.trim(),
        is_read: false,
      },
    });

    // Обновляем письмо - устанавливаем флаг нового сообщения от пациента
    await prisma.letter.update({
      where: { id: letterId },
      data: {
        has_new_patient_message: true,
        is_read: false, // Главврач должен прочитать новое сообщение
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при отправке сообщения" },
      { status: 500 }
    );
  }
}
