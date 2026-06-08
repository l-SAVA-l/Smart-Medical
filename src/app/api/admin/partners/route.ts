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

// GET - Получить всех партнёров
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

    // Формируем условия поиска
    const whereCondition: any = {};
    if (search) {
      whereCondition.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Подсчитываем общее количество
    const totalCount = await prisma.partner.count({ where: whereCondition });

    // Получаем партнёров для текущей страницы
    const partners = await prisma.partner.findMany({
      where: whereCondition,
      include: {
        category: true,
      },
      orderBy: { name: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      data: partners,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при получении партнёров" },
      { status: 500 }
    );
  }
}

// POST - Создать нового партнёра
export async function POST(request: NextRequest) {
  try {
    const adminCheck = await checkAdmin(request);
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: adminCheck.error }, { status: 403 });
    }

    const data = await request.json();

    // Проверяем, что category_id предоставлен
    if (!data.category_id) {
      return NextResponse.json(
        { error: "Категория обязательна" },
        { status: 400 }
      );
    }

    const partner = await prisma.partner.create({
      data: {
        name: data.name,
        description: data.description,
        image_url: data.image_url || '',
        website_url: data.website_url || '',
        number: parseInt(data.number) || 1,
        category_id: parseInt(data.category_id),
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(partner, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при создании партнёра" },
      { status: 500 }
    );
  }
}
