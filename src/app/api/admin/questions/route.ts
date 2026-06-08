import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

const CLINIC_FAQ_SLUGS = [
  "children-teeth",
  "girls-hygiene",
  "boys-hygiene",
  "girls-puberty",
  "culdocentesis",
  "stomatology",
  "polyp-removal",
  "ultrasound",
  "womens-health",
  "curettage",
];

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

async function validateQuestionScope(serviceId: number | null, questionCategoryId: number | null) {
  if (!serviceId && !questionCategoryId) {
    return "Укажите либо услугу (service_id), либо категорию вопросов клиники (question_category_id)";
  }

  if (serviceId && questionCategoryId) {
    return "Вопрос не может одновременно относиться и к услуге, и к категории FAQ клиники";
  }

  if (questionCategoryId) {
    const category = await prisma.questionCategory.findUnique({
      where: { id: questionCategoryId },
      select: { slug: true, is_active: true },
    });

    if (!category || !category.is_active || !CLINIC_FAQ_SLUGS.includes(category.slug)) {
      return "Выбрана недопустимая категория FAQ для раздела Клиника";
    }
  }

  return null;
}

// GET - Получить все вопросы
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
        { question: { contains: search, mode: 'insensitive' } },
        { answer: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Подсчитываем общее количество
    const totalCount = await prisma.question.count({ where: whereCondition });

    // Получаем вопросы для текущей страницы
    const questions = await prisma.question.findMany({
      where: whereCondition,
      include: {
        service: {
          select: { id: true, title: true },
        },
        questionCategory: {
          select: { id: true, name: true },
        },
      },
      orderBy: { id: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      data: questions,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при получении вопросов" },
      { status: 500 }
    );
  }
}

// POST - Создать новый вопрос
export async function POST(request: NextRequest) {
  try {
    const adminCheck = await checkAdmin(request);
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: adminCheck.error }, { status: 403 });
    }

    const data = await request.json();
    const serviceId = data.service_id ? parseInt(data.service_id) : null;
    const questionCategoryId = data.question_category_id ? parseInt(data.question_category_id) : null;

    const scopeError = await validateQuestionScope(serviceId, questionCategoryId);
    if (scopeError) {
      return NextResponse.json({ error: scopeError }, { status: 400 });
    }

    const question = await prisma.question.create({
      data: {
        question: data.question,
        answer: data.answer || null,
        service_id: serviceId,
        question_category_id: questionCategoryId,
      },
      include: {
        service: {
          select: { id: true, title: true },
        },
        questionCategory: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при создании вопроса" },
      { status: 500 }
    );
  }
}
