import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Check if login or phone is already taken
 * GET /api/auth/check-unique?login=xxx or ?phone=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const login = searchParams.get('login');
    const phone = searchParams.get('phone');
    const email = searchParams.get('email');
    const excludeId = searchParams.get('excludeId'); // For profile updates

    if (!login && !phone && !email) {
      return NextResponse.json(
        { error: "Укажите login, phone или email для проверки" },
        { status: 400 }
      );
    }

    const excludeCondition = excludeId
      ? { id: { not: parseInt(excludeId) } }
      : {};

    // Check login uniqueness
    if (login) {
      const existingLogin = await prisma.patient.findFirst({
        where: {
          login: login,
          ...excludeCondition,
        },
      });

      return NextResponse.json({
        field: 'login',
        value: login,
        isUnique: !existingLogin,
        message: existingLogin ? 'Этот логин уже занят' : null,
      });
    }

    // Check phone uniqueness
    if (phone) {
      // Normalize phone - keep only digits
      const normalizedPhone = phone.replace(/\D/g, '');
      const last9Digits = normalizedPhone.slice(-9);

      // Получаем все телефоны и проверяем после нормализации
      // (для совместимости со старыми данными в разных форматах)
      const allPatients = await prisma.patient.findMany({
        where: excludeCondition,
        select: { id: true, phone: true },
      });

      const existingPhone = allPatients.find(patient => {
        const patientNormalized = patient.phone.replace(/\D/g, '');
        // Проверяем полное совпадение или совпадение последних 9 цифр
        return patientNormalized === normalizedPhone ||
               patientNormalized.slice(-9) === last9Digits;
      });

      return NextResponse.json({
        field: 'phone',
        value: phone,
        isUnique: !existingPhone,
        message: existingPhone ? 'Этот номер телефона уже зарегистрирован' : null,
      });
    }

    // Check email uniqueness
    if (email) {
      const existingEmail = await prisma.patient.findFirst({
        where: {
          email: email.toLowerCase(),
          ...excludeCondition,
        },
      });

      return NextResponse.json({
        field: 'email',
        value: email,
        isUnique: !existingEmail,
        message: existingEmail ? 'Этот email уже зарегистрирован' : null,
      });
    }

    return NextResponse.json({ error: "Неизвестная ошибка" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при проверке уникальности" },
      { status: 500 }
    );
  }
}
