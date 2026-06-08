import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import { validateLetter } from "@/utils/validation";

// GET - Получить письма пользователя
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

    const letters = await prisma.letter.findMany({
      where: { patient_id: userId },
      include: {
        messages: {
          orderBy: { created_at: 'asc' },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json(letters);
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при получении писем" },
      { status: 500 }
    );
  }
}

// POST - Отправить письмо главному врачу
export async function POST(request: NextRequest) {
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

    // Проверяем, не заблокирован ли пользователь
    const user = await prisma.patient.findUnique({
      where: { id: userId },
      select: { is_messages_blocked: true },
    });

    if (user?.is_messages_blocked) {
      return NextResponse.json(
        { error: "Вы заблокированы и не можете отправлять письма главному врачу" },
        { status: 403 }
      );
    }

    const { subject, content } = await request.json();

    // Validate letter
    const validation = validateLetter({ subject, content });
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const letter = await prisma.letter.create({
      data: {
        patient_id: userId,
        subject,
        content,
      },
    });

    return NextResponse.json(letter);
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при отправке письма" },
      { status: 500 }
    );
  }
}
