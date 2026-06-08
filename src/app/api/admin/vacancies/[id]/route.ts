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

// PUT - Обновить вакансию
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
    const vacancyId = parseInt(id);
    const data = await request.json();

    const vacancy = await prisma.vacancy.update({
      where: { id: vacancyId },
      data: {
        name: data.name,
        category: data.category,
        description: data.description,
        payment: parseInt(data.payment),
        experience: parseInt(data.experience),
        requirements: data.requirements,
      },
    });

    return NextResponse.json(vacancy);
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при обновлении вакансии" },
      { status: 500 }
    );
  }
}

// DELETE - Удалить вакансию
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
    const vacancyId = parseInt(id);

    await prisma.vacancy.delete({
      where: { id: vacancyId },
    });

    return NextResponse.json({ success: true, message: "Вакансия удалена" });
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при удалении вакансии" },
      { status: 500 }
    );
  }
}
