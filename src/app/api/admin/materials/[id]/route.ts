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

// PUT - Обновить материал
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
    const materialId = parseInt(id);
    const data = await request.json();

    const material = await prisma.material.update({
      where: { id: materialId },
      data: {
        title: data.title,
        content: data.content,
        detailed_content: data.detailed_content || null,
        image_url: data.image_url,
        date: new Date(data.date),
        year: parseInt(data.year),
        is_active: data.is_active ?? true,
      },
    });

    return NextResponse.json(material);
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при обновлении материала" },
      { status: 500 }
    );
  }
}

// DELETE - Удалить материал
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
    const materialId = parseInt(id);

    await prisma.material.delete({
      where: { id: materialId },
    });

    return NextResponse.json({ success: true, message: "Материал удален" });
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при удалении материала" },
      { status: 500 }
    );
  }
}
