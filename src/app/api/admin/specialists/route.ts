import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkFullAdminAccess } from "@/utils/api-auth";

// GET - Получить всех специалистов
export async function GET(request: NextRequest) {
  try {
    const adminCheck = await checkFullAdminAccess(request);
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: adminCheck.error }, { status: 403 });
    }

    const specialists = await prisma.specialist.findMany({
      include: {
        serviceCategory: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { id: "desc" },
    });

    return NextResponse.json(specialists);
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при получении специалистов" },
      { status: 500 }
    );
  }
}

// POST - Создать нового специалиста
export async function POST(request: NextRequest) {
  try {
    const adminCheck = await checkFullAdminAccess(request);
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: adminCheck.error }, { status: 403 });
    }

    const data = await request.json();

    console.log('Creating specialist with data:', {
      ...data,
      service_category_id: data.service_category_id ? parseInt(data.service_category_id) : null,
    });

    const specialist = await prisma.specialist.create({
      data: {
        name: data.name,
        specialization: data.specialization,
        qualification: data.qualification,
        experience: parseInt(data.experience),
        grade: parseInt(data.grade),
        image_url: data.image_url || "/images/default-doctor.jpg",
        activity_area: data.activity_area || null,
        education_details: data.education_details || null,
        conferences: data.conferences || [],
        specializations: data.specializations || [],
        education: data.education || [],
        work_examples: data.work_examples || null,
        service_category_id: data.service_category_id ? parseInt(data.service_category_id) : null,
      },
      include: {
        serviceCategory: true,
      },
    });

    return NextResponse.json(specialist, { status: 201 });
  } catch (error) {
    console.error('Error creating specialist:', error);
    return NextResponse.json(
      { error: "Ошибка при создании специалиста", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
