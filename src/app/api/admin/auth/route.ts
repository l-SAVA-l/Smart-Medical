import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { hasAdminAccess } from "@/utils/auth";

const ADMIN_GATE_PASSWORD = "admin123"; // Пароль для экрана «Введите пароль для доступа»

// POST - Проверка пароля для входа в админ-панель
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const password = typeof body?.password === "string" ? body.password.trim() : "";

    if (password !== ADMIN_GATE_PASSWORD) {
      return NextResponse.json(
        { error: "Неверный пароль" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Вход выполнен успешно"
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при авторизации" },
      { status: 500 }
    );
  }
}

// GET - Проверка доступа пользователя к админ-панели на основе роли
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Если нет сессии или пользователя
    if (!session || !session.user) {
      return NextResponse.json({
        isAdmin: false
      });
    }

    // Проверяем роль пользователя
    const userRole = session.user.role;
    const isAdminUser = hasAdminAccess(userRole);

    return NextResponse.json({
      isAdmin: isAdminUser,
      role: userRole
    });
  } catch (error) {
    return NextResponse.json({
      isAdmin: false
    });
  }
}
