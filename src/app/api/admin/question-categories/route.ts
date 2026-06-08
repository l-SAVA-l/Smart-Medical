import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - получить все категории вопросов
export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.questionCategory.findMany({
      orderBy: {
        order: 'asc'
      },
      include: {
        _count: {
          select: { questions: true }
        }
      }
    });

    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error("Error fetching question categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch question categories" },
      { status: 500 }
    );
  }
}

// POST - создать категорию
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, description, order } = body;

    // Валидация
    if (!name || !slug) {
      return NextResponse.json(
        { error: "Название и slug обязательны" },
        { status: 400 }
      );
    }

    // Проверяем уникальность slug
    const existingSlug = await prisma.questionCategory.findUnique({
      where: { slug }
    });

    if (existingSlug) {
      return NextResponse.json(
        { error: "Категория с таким slug уже существует" },
        { status: 400 }
      );
    }

    // Проверяем уникальность порядка
    if (order !== undefined && order !== null) {
      const existingOrder = await prisma.questionCategory.findFirst({
        where: { order: parseInt(order) }
      });

      if (existingOrder) {
        return NextResponse.json(
          { error: `Порядок сортировки ${order} уже занят другой категорией` },
          { status: 400 }
        );
      }
    }

    const category = await prisma.questionCategory.create({
      data: {
        name,
        slug,
        description: description || null,
        order: order ? parseInt(order) : 0,
      }
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Error creating question category:", error);
    return NextResponse.json(
      { error: "Failed to create question category" },
      { status: 500 }
    );
  }
}
