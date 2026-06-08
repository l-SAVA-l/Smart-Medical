import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

// GET - Получить все письма (только для главного врача)
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

    // Проверяем роль пользователя
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

    // Получаем параметры пагинации и поиска
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';

    // Формируем условия поиска
    const whereCondition: any = {};

    // Фильтр по статусу
    if (status === 'unread') {
      // Письма без ответа ИЛИ с новыми сообщениями от пациента
      whereCondition.OR = [
        { reply: null },
        { has_new_patient_message: true }
      ];
    } else if (status === 'replied') {
      // Письма с ответом и без новых сообщений
      whereCondition.AND = [
        { reply: { not: null } },
        { has_new_patient_message: false }
      ];
    }
    // Если 'all', не добавляем фильтр по статусу

    if (search) {
      // Если уже есть OR или AND, нужно обернуть в дополнительный уровень
      const searchCondition = {
        OR: [
          { subject: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
          { patient: { name: { contains: search, mode: 'insensitive' } } },
        ],
      };

      if (whereCondition.OR || whereCondition.AND) {
        // Объединяем условия
        whereCondition.AND = [
          ...(whereCondition.AND || []),
          ...(whereCondition.OR ? [{ OR: whereCondition.OR }] : []),
          searchCondition,
        ];
        delete whereCondition.OR;
      } else {
        Object.assign(whereCondition, searchCondition);
      }
    }

    // Подсчитываем общее количество
    const totalCount = await prisma.letter.count({ where: whereCondition });

    // Получаем письма для текущей страницы
    const letters = await prisma.letter.findMany({
      where: whereCondition,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        messages: {
          orderBy: {
            created_at: 'asc',
          },
        },
      },
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      data: letters,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при получении писем" },
      { status: 500 }
    );
  }
}
