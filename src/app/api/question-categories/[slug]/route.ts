import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const CLINIC_FAQ_CATEGORY_META: Record<string, { name: string; order: number }> = {
  "children-teeth": { name: "Детские зубы", order: 1 },
  "girls-hygiene": { name: "Гигиена девочек", order: 2 },
  "boys-hygiene": { name: "Гигиена мальчиков", order: 3 },
  "girls-puberty": { name: "Половое созревание девочек", order: 4 },
  culdocentesis: { name: "Кульдоцентез", order: 5 },
  stomatology: { name: "Стоматология", order: 6 },
  "polyp-removal": { name: "Удаление полипов", order: 7 },
  ultrasound: { name: "УЗИ", order: 8 },
  "womens-health": { name: "Женское здоровье", order: 9 },
  curettage: { name: "Раздельное диагностическое выскабливание", order: 10 },
};

// GET - получить категорию по slug с вопросами
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const clinicMeta = CLINIC_FAQ_CATEGORY_META[slug];

    if (!clinicMeta) {
      return NextResponse.json(
        { error: "Категория не найдена" },
        { status: 404 }
      );
    }

    const category = await prisma.questionCategory.findFirst({
      where: {
        slug,
        is_active: true
      },
      include: {
        questions: {
          where: {
            service_id: null,
            answer: { not: null } // Показываем только вопросы с ответами клиники
          },
          orderBy: {
            id: 'asc'
          }
        }
      }
    });

    if (!category) {
      return NextResponse.json(
        { error: "Категория не найдена" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        ...category,
        name: clinicMeta.name,
        order: clinicMeta.order,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching question category:", error);
    return NextResponse.json(
      { error: "Failed to fetch question category" },
      { status: 500 }
    );
  }
}
