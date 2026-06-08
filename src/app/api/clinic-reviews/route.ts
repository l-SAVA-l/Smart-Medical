import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Получаем отзывы для общей страницы клиники (verified = true)
    const reviews = await prisma.feedback.findMany({
      where: {
        verified: true
      },
      orderBy: {
        date: 'desc'
      },
      skip,
      take: limit
    });

    // Получаем общее количество отзывов
    const total = await prisma.feedback.count({
      where: {
        verified: true
      }
    });

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch clinic reviews" },
      { status: 500 }
    );
  }
}
