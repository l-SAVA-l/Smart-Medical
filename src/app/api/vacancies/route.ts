import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "6");
    const skip = (page - 1) * limit;

    // Формируем условие фильтрации
    const where: any = {};
    if (category) {
      where.category = category;
    }

    // Получаем вакансии с пагинацией
    const [vacancies, total] = await Promise.all([
      prisma.vacancy.findMany({
        where,
        orderBy: {
          id: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.vacancy.count({ where })
    ]);

    return NextResponse.json({
      vacancies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch vacancies" },
      { status: 500 }
    );
  }
}
