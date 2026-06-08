import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { login, password } = body;

    // Валидация обязательных полей
    if (!login || !password) {
      return NextResponse.json(
        { error: "Логин и пароль обязательны для заполнения" },
        { status: 400 }
      );
    }

    // Поиск пользователя по логину
    const user = await prisma.patient.findFirst({
      where: { login },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Неверный логин или пароль" },
        { status: 401 }
      );
    }

    // Проверка пароля
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Неверный логин или пароль" },
        { status: 401 }
      );
    }

    // Возвращаем успешный ответ с данными пользователя (без пароля)
    return NextResponse.json(
      {
        message: "Вход выполнен успешно",
        user: {
          id: user.id,
          login: user.login,
          email: user.email,
          name: user.name,
          phone: user.phone,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при входе. Попробуйте позже." },
      { status: 500 }
    );
  }
}

