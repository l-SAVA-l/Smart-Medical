import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkFullAdminAccess } from "@/utils/api-auth";

// GET - Получить специалиста по ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminCheck = await checkFullAdminAccess(request);
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: adminCheck.error }, { status: 403 });
    }

    const { id } = await params;
    const specialistId = parseInt(id);

    const specialist = await prisma.specialist.findUnique({
      where: { id: specialistId },
      include: {
        serviceCategory: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!specialist) {
      return NextResponse.json(
        { error: "Специалист не найден" },
        { status: 404 }
      );
    }

    return NextResponse.json(specialist);
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при получении специалиста" },
      { status: 500 }
    );
  }
}

// PUT - Обновить специалиста
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminCheck = await checkFullAdminAccess(request);
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: adminCheck.error }, { status: 403 });
    }

    const { id } = await params;
    const specialistId = parseInt(id);
    const data = await request.json();

    const specialist = await prisma.specialist.update({
      where: { id: specialistId },
      data: {
        name: data.name,
        specialization: data.specialization,
        qualification: data.qualification,
        experience: parseInt(data.experience),
        grade: parseInt(data.grade),
        image_url: data.image_url,
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

    return NextResponse.json(specialist);
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при обновлении специалиста" },
      { status: 500 }
    );
  }
}

// DELETE - Удалить специалиста
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminCheck = await checkFullAdminAccess(request);
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: adminCheck.error }, { status: 403 });
    }

    const { id } = await params;
    const specialistId = parseInt(id);

    await prisma.specialist.delete({
      where: { id: specialistId },
    });

    return NextResponse.json({ success: true, message: "Специалист удален" });
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при удалении специалиста" },
      { status: 500 }
    );
  }
}
