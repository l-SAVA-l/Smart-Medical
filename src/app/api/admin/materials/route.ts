import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

// Middleware для проверки админа
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

// GET - Получить все материалы
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
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Подсчитываем общее количество
    const totalCount = await prisma.material.count({ where: whereCondition });

    // Получаем материалы для текущей страницы
    const materials = await prisma.material.findMany({
      where: whereCondition,
      orderBy: { date: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      data: materials,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при получении материалов" },
      { status: 500 }
    );
  }
}

// POST - Создать новый материал
export async function POST(request: NextRequest) {
  try {
    const adminCheck = await checkAdmin(request);
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: adminCheck.error }, { status: 403 });
    }

    const data = await request.json();

    const material = await prisma.material.create({
      data: {
        title: data.title,
        content: data.content,
        detailed_content: data.detailed_content || null,
        image_url: data.image_url,
        date: new Date(data.date),
        year: parseInt(data.year),
        is_active: data.is_active ?? true,
      },
    });

    return NextResponse.json(material, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при создании материала" },
      { status: 500 }
    );
  }
}
