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

const CLINIC_FAQ_SLUGS = Object.keys(CLINIC_FAQ_CATEGORY_META);

// GET - получить все активные категории вопросов (публичный endpoint)
export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.questionCategory.findMany({
      where: {
        is_active: true,
        slug: {
          in: CLINIC_FAQ_SLUGS,
        },
      },
      orderBy: {
        order: 'asc'
      },
      include: {
        questions: {
          where: {
            service_id: null,
            answer: { not: null },
          },
          select: {
            id: true,
          },
        }
      }
    });

    const normalizedCategories = categories
      .map(({ questions, ...category }) => {
        const clinicMeta = CLINIC_FAQ_CATEGORY_META[category.slug];
        if (!clinicMeta) return null;

        return {
          ...category,
          name: clinicMeta.name,
          order: clinicMeta.order,
          _count: {
            questions: questions.length,
          },
        };
      })
      .filter((category): category is NonNullable<typeof category> => Boolean(category))
      .sort((a, b) => a.order - b.order);

    return NextResponse.json(normalizedCategories, { status: 200 });
  } catch (error) {
    console.error("Error fetching question categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch question categories" },
      { status: 500 }
    );
  }
}
