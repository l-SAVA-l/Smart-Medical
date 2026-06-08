import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkFullAdminAccess } from "@/utils/api-auth";
import bcrypt from "bcryptjs";

// GET - Получить всех пользователей (для главного врача и администраторов)
export async function GET(request: NextRequest) {
  try {
    const adminCheck = await checkFullAdminAccess(request);
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: adminCheck.error }, { status: 403 });
    }

    // Получаем параметры пагинации и поиска
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const roleFilter = searchParams.get('role') || 'all';

    // Формируем условия поиска
    const whereCondition: any = {
      role: { not: "CHIEF_DOCTOR" }
    };

    if (search) {
      whereCondition.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { login: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Фильтр по роли
    if (roleFilter === 'admin') {
      whereCondition.role = 'ADMIN';
    } else if (roleFilter === 'operator') {
      whereCondition.role = 'OPERATOR';
    }

    // Подсчитываем общее количество
    const totalCount = await prisma.patient.count({
      where: whereCondition,
    });

    // Получаем пользователей для текущей страницы
    const users = await prisma.patient.findMany({
      where: whereCondition,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        login: true,
        role: true,
        avatar_url: true,
        registration_date: true,
        is_messages_blocked: true,
      },
      orderBy: { registration_date: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      data: users,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при получении пользователей" },
      { status: 500 }
    );
  }
}

// PUT - Изменить роль пользователя (для главного врача и администраторов)
export async function PUT(request: NextRequest) {
  try {
    const adminCheck = await checkFullAdminAccess(request);
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: adminCheck.error }, { status: 403 });
    }

    const currentUserId = adminCheck.userId!;
    const currentUserRole = adminCheck.role!;

    // Получаем пароль текущего пользователя для проверки при назначении ADMIN
    const currentUser = await prisma.patient.findUnique({
      where: { id: currentUserId },
      select: { password: true },
    });

    const { userId, newRole, adminPassword } = await request.json();

    // Валидация данных
    if (!userId || !newRole) {
      return NextResponse.json(
        { error: "Не указан пользователь или роль" },
        { status: 400 }
      );
    }

    // Проверяем что роль допустимая
    if (!["USER", "OPERATOR", "ADMIN"].includes(newRole)) {
      return NextResponse.json(
        { error: "Недопустимая роль" },
        { status: 400 }
      );
    }

    // ADMIN может назначать только OPERATOR (не ADMIN)
    if (currentUserRole === "ADMIN" && newRole === "ADMIN") {
      return NextResponse.json(
        { error: "Администратор не может назначать других администраторов" },
        { status: 403 }
      );
    }

    // Если назначаем ADMIN - требуем подтверждение пароля (только CHIEF_DOCTOR может)
    if (newRole === "ADMIN") {
      if (!adminCheck.canManageAdmins) {
        return NextResponse.json(
          { error: "Только главный врач может назначать администраторов" },
          { status: 403 }
        );
      }

      if (!adminPassword) {
        return NextResponse.json(
          { error: "Для назначения администратора требуется подтверждение пароля" },
          { status: 400 }
        );
      }

      // Проверяем пароль главного врача
      if (!currentUser) {
        return NextResponse.json(
          { error: "Ошибка проверки пароля" },
          { status: 500 }
        );
      }

      const isPasswordValid = await bcrypt.compare(adminPassword, currentUser.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "Неверный пароль" },
          { status: 401 }
        );
      }
    }

    // Получаем целевого пользователя
    const targetUser = await prisma.patient.findUnique({
      where: { id: parseInt(userId) },
      select: { role: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      );
    }

    // Нельзя менять роль главному врачу
    if (targetUser.role === "CHIEF_DOCTOR") {
      return NextResponse.json(
        { error: "Нельзя изменить роль главного врача" },
        { status: 403 }
      );
    }

    // ADMIN не может снимать права с ADMIN (только CHIEF_DOCTOR)
    if (currentUserRole === "ADMIN" && targetUser.role === "ADMIN") {
      return NextResponse.json(
        { error: "Администратор не может изменять роль другого администратора" },
        { status: 403 }
      );
    }

    // Обновляем роль
    const updatedUser = await prisma.patient.update({
      where: { id: parseInt(userId) },
      data: { role: newRole },
      select: {
        id: true,
        name: true,
        role: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при изменении роли" },
      { status: 500 }
    );
  }
}
