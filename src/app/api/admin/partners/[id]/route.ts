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

// PUT - Обновить партнёра
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
    const partnerId = parseInt(id);
    const data = await request.json();

    const partner = await prisma.partner.update({
      where: { id: partnerId },
      data: {
        name: data.name,
        description: data.description,
        image_url: data.image_url || '',
        website_url: data.website_url || '',
        number: parseInt(data.number) || 1,
        category_id: data.category_id ? parseInt(data.category_id) : undefined,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(partner);
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при обновлении партнёра" },
      { status: 500 }
    );
  }
}

// DELETE - Удалить партнёра
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
    const partnerId = parseInt(id);

    await prisma.partner.delete({
      where: { id: partnerId },
    });

    return NextResponse.json({ success: true, message: "Партнёр удален" });
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при удалении партнёра" },
      { status: 500 }
    );
  }
}
