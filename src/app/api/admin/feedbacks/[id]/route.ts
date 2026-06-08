import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

async function checkAdmin(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  if (!token || !token.id) {
    return { isAdmin: false, error: "Не авторизован" };
  }

  const userId = parseInt(token.id as string);
  const user = await prisma.patient.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user || (user.role !== "ADMIN" && user.role !== "CHIEF_DOCTOR")) {
    return { isAdmin: false, error: "Нет прав доступа" };
  }

  return { isAdmin: true };
}

// PUT - Обновить отзыв
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminCheck = await checkAdmin(request);
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: adminCheck.error }, { status: 403 });
    }

    const { id } = await params;
    const feedbackId = parseInt(id);
    const data = await request.json();

    // Формируем объект обновления только с переданными полями
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.text !== undefined) updateData.text = data.text;
    if (data.date !== undefined) updateData.date = new Date(data.date);
    if (data.grade !== undefined) updateData.grade = parseInt(data.grade);
    if (data.image_url !== undefined) updateData.image_url = data.image_url;
    if (data.verified !== undefined) updateData.verified = data.verified;
    if (data.service_id !== undefined) {
      updateData.service_id = data.service_id ? parseInt(data.service_id) : null;
    }

    const feedback = await prisma.feedback.update({
      where: { id: feedbackId },
      data: updateData,
      include: {
        service: {
          select: { id: true, title: true },
        },
      },
    });

    return NextResponse.json(feedback);
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при обновлении отзыва" },
      { status: 500 }
    );
  }
}

// DELETE - Удалить отзыв
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminCheck = await checkAdmin(request);
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: adminCheck.error }, { status: 403 });
    }

    const { id } = await params;
    const feedbackId = parseInt(id);

    await prisma.feedback.delete({
      where: { id: feedbackId },
    });

    return NextResponse.json({ success: true, message: "Отзыв удален" });
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при удалении отзыва" },
      { status: 500 }
    );
  }
}
