import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const year = searchParams.get("year");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Формируем фильтр
    const where: any = {
      is_active: true,
    };

    if (year && year !== "all") {
      where.year = parseInt(year);
    }

    // Получаем материалы с пагинацией
    const [materials, total] = await Promise.all([
      prisma.material.findMany({
        where,
        orderBy: {
          date: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.material.count({ where }),
    ]);

    // Форматируем данные для фронтенда
    const formattedMaterials = materials.map((material) => ({
      id: material.id.toString(),
      title: material.title,
      content: material.content,
      detailed_content: material.detailed_content,
      image: material.image_url,
      date: material.date.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      dateRaw: material.date.toISOString(), // Для расчета "Новое"
      year: material.year,
    }));

    return NextResponse.json(
      {
        materials: formattedMaterials,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при получении материалов" },
      { status: 500 }
    );
  }
}
