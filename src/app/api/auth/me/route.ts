import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

export async function GET(request: NextRequest) {
  try {
    // Получаем токен из cookies
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

    const user = await prisma.patient.findUnique({
      where: { id: userId },
      select: {
        id: true,
        login: true,
        email: true,
        name: true,
        phone: true,
        registration_date: true,
        avatar_url: true,
        role: true,
        is_messages_blocked: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при получении данных пользователя" },
      { status: 500 }
    );
  }
}

