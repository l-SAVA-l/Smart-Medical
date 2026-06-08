import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

export async function PUT(request: NextRequest) {
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
    const body = await request.json();
    const { name, login } = body;

    // Валидация имени
    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Имя должно содержать минимум 2 символа" },
        { status: 400 }
      );
    }

    // Валидация логина
    if (!login || login.trim().length < 3) {
      return NextResponse.json(
        { error: "Логин должен содержать минимум 3 символа" },
        { status: 400 }
      );
    }

    // Проверяем уникальность логина (кроме текущего пользователя)
    const existingLoginUser = await prisma.patient.findFirst({
      where: {
        login: login.trim(),
        NOT: { id: userId }
      }
    });

    if (existingLoginUser) {
      return NextResponse.json(
        { error: "Этот логин уже занят" },
        { status: 400 }
      );
    }

    // Обновляем профиль (только имя и логин, email и телефон нельзя менять)
    const updatedUser = await prisma.patient.update({
      where: { id: userId },
      data: {
        name: name.trim(),
        login: login.trim(),
      },
      select: {
        id: true,
        login: true,
        email: true,
        name: true,
        phone: true,
        registration_date: true,
        avatar_url: true,
      },
    });

    return NextResponse.json(
      {
        message: "Профиль успешно обновлен",
        user: updatedUser
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при обновлении профиля" },
      { status: 500 }
    );
  }
}
