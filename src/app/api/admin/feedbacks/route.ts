import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

async function checkAdmin(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  if (!token || !token.id) {
    return { isAdmin: false, error: "Не авторизован" };
  }

  const userId = parseInt(token.id as string);
  const user = await prisma.patient.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user || (user.role !== "ADMIN" && user.role !== "CHIEF_DOCTOR")) {
    return { isAdmin: false, error: "Нет прав доступа" };
  }

  return { isAdmin: true };
}

// GET - Получить все отзывы
export async function GET(request: NextRequest) {
  try {
    const adminCheck = await checkAdmin(request);
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: adminCheck.error }, { status: 403 });
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
    if (status === 'pending') {
      whereCondition.verified = false;
    } else if (status === 'approved' || status === 'verified') {
      whereCondition.verified = true;
    }
    // Если 'all', не добавляем фильтр по verified

    if (search) {
      whereCondition.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { text: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Подсчитываем общее количество
    const totalCount = await prisma.feedback.count({ where: whereCondition });

    // Получаем отзывы для текущей страницы
    const feedbacks = await prisma.feedback.findMany({
      where: whereCondition,
      orderBy: { date: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      data: feedbacks,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при получении отзывов" },
      { status: 500 }
    );
  }
}

// POST - Создать новый отзыв
export async function POST(request: NextRequest) {
  try {
    const adminCheck = await checkAdmin(request);
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: adminCheck.error }, { status: 403 });
    }

    const data = await request.json();

    const feedback = await prisma.feedback.create({
      data: {
        name: data.name,
        text: data.text,
        date: new Date(data.date),
        grade: parseInt(data.grade),
        image_url: data.image_url,
        verified: data.verified ?? false,
        service_id: data.service_id ? parseInt(data.service_id) : null,
      },
      include: {
        service: {
          select: { id: true, title: true },
        },
      },
    });

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при создании отзыва" },
      { status: 500 }
    );
  }
}
