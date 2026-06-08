import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

// GET - Получить список заблокированных пользователей
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

    // Проверяем роль - должен быть OPERATOR, ADMIN или CHIEF_DOCTOR
    const user = await prisma.patient.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || !['OPERATOR', 'ADMIN', 'CHIEF_DOCTOR'].includes(user.role)) {
      return NextResponse.json(
        { error: "Нет доступа" },
        { status: 403 }
      );
    }

    // Получаем заблокированных пользователей
    const blockedUsers = await prisma.patient.findMany({
      where: {
        is_messages_blocked: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar_url: true,
        phone: true,
        registration_date: true,
      },
      orderBy: { registration_date: 'desc' },
    });

    return NextResponse.json({ users: blockedUsers });
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при получении заблокированных пользователей" },
      { status: 500 }
    );
  }
}

// PATCH - Разблокировать пользователя
export async function PATCH(request: NextRequest) {
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
    const { patientId } = await request.json();

    if (!patientId) {
      return NextResponse.json(
        { error: "Не указан пользователь" },
        { status: 400 }
      );
    }

    // Проверяем роль - должен быть OPERATOR, ADMIN или CHIEF_DOCTOR
    const user = await prisma.patient.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || !['OPERATOR', 'ADMIN', 'CHIEF_DOCTOR'].includes(user.role)) {
      return NextResponse.json(
        { error: "Нет доступа" },
        { status: 403 }
      );
    }

    // Разблокируем пользователя
    await prisma.patient.update({
      where: { id: parseInt(patientId) },
      data: { is_messages_blocked: false },
    });

    return NextResponse.json({ success: true, message: "Пользователь разблокирован" });
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при разблокировке пользователя" },
      { status: 500 }
    );
  }
}
