import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - получить категорию по ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const categoryId = parseInt(id);

    const category = await prisma.questionCategory.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: { questions: true }
        }
      }
    });

    if (!category) {
      return NextResponse.json(
        { error: "Категория не найдена" },
        { status: 404 }
      );
    }

    return NextResponse.json(category, { status: 200 });
  } catch (error) {
    console.error("Error fetching question category:", error);
    return NextResponse.json(
      { error: "Failed to fetch question category" },
      { status: 500 }
    );
  }
}

// PUT - обновить категорию
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const categoryId = parseInt(id);
    const body = await request.json();
    const { name, slug, description, order, is_active } = body;

    // Проверяем существование категории
    const existing = await prisma.questionCategory.findUnique({
      where: { id: categoryId }
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Категория не найдена" },
        { status: 404 }
      );
    }

    // Проверяем уникальность slug (если изменился)
    if (slug && slug !== existing.slug) {
      const existingSlug = await prisma.questionCategory.findUnique({
        where: { slug }
      });

      if (existingSlug) {
        return NextResponse.json(
          { error: "Категория с таким slug уже существует" },
          { status: 400 }
        );
      }
    }

    // Проверяем уникальность порядка (если изменился)
    if (order !== undefined && order !== null && parseInt(order) !== existing.order) {
      const existingOrder = await prisma.questionCategory.findFirst({
        where: {
          order: parseInt(order),
          id: { not: categoryId }
        }
      });

      if (existingOrder) {
        return NextResponse.json(
          { error: `Порядок сортировки ${order} уже занят другой категорией` },
          { status: 400 }
        );
      }
    }

    const category = await prisma.questionCategory.update({
      where: { id: categoryId },
      data: {
        name: name || existing.name,
        slug: slug || existing.slug,
        description: description !== undefined ? description : existing.description,
        order: order !== undefined ? parseInt(order) : existing.order,
        is_active: is_active !== undefined ? is_active : existing.is_active,
      }
    });

    return NextResponse.json(category, { status: 200 });
  } catch (error) {
    console.error("Error updating question category:", error);
    return NextResponse.json(
      { error: "Failed to update question category" },
      { status: 500 }
    );
  }
}

// DELETE - удалить категорию
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const categoryId = parseInt(id);

    // Проверяем наличие связанных вопросов
    const questionsCount = await prisma.question.count({
      where: { question_category_id: categoryId }
    });

    if (questionsCount > 0) {
      return NextResponse.json(
        { error: `Невозможно удалить категорию: к ней привязано ${questionsCount} вопросов` },
        { status: 400 }
      );
    }

    await prisma.questionCategory.delete({
      where: { id: categoryId }
    });

    return NextResponse.json(
      { message: "Категория удалена" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting question category:", error);
    return NextResponse.json(
      { error: "Failed to delete question category" },
      { status: 500 }
    );
  }
}
