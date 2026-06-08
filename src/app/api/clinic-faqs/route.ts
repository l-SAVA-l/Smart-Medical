import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    let faqs;
    if (category) {
      const questionCategory = await prisma.questionCategory.findUnique({
        where: { slug: category },
        select: { id: true },
      });

      if (!questionCategory) {
        return NextResponse.json([], { status: 200 });
      }

      faqs = await prisma.question.findMany({
        where: {
          service_id: null,
          question_category_id: questionCategory.id,
          answer: { not: null } // Показываем только вопросы с ответами
        },
        include: {
          questionCategory: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: {
          id: 'asc'
        }
      });
    } else {
      faqs = await prisma.question.findMany({
        where: {
          service_id: null,
          answer: { not: null } // Показываем только вопросы с ответами
        },
        include: {
          questionCategory: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        },
        orderBy: {
          id: 'asc'
        }
      });
    }

    return NextResponse.json(faqs, { status: 200 });
  } catch (error) {
    console.error("Error fetching clinic FAQs:", error);
    return NextResponse.json(
      { error: "Failed to fetch clinic FAQs" },
      { status: 500 }
    );
  }
}
