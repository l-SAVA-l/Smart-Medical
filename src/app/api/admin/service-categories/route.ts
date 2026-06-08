import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

// GET - получить все категории (только корневые, без подкатегорий)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Получаем только корневые категории (parent_id = null)
    // @ts-ignore - ServiceCategory будет доступна после npx prisma generate
    const categories = await prisma.serviceCategory.findMany({
      where: {
        parent_id: null, // Только корневые категории
      },
      orderBy: [
        { order: 'asc' },
        { name: 'asc' },
      ],
    });

    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch service categories' },
      { status: 500 }
    );
  }
}

// POST - создать новую категорию
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, icon, description, parent_id, order } = body;

    // Проверяем уникальность slug
    // @ts-ignore - ServiceCategory будет доступна после npx prisma generate
    const existing = await prisma.serviceCategory.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Категория с таким slug уже существует' },
        { status: 400 }
      );
    }

    // Проверяем уникальность order в пределах одного уровня
    // @ts-ignore - ServiceCategory будет доступна после npx prisma generate
    const orderExists = await prisma.serviceCategory.findFirst({
      where: {
        order: order || 0,
        parent_id: parent_id || null,
      },
    });

    if (orderExists) {
      return NextResponse.json(
        { error: `Порядок сортировки ${order || 0} уже занят другой категорией на этом уровне. Выберите другое значение.` },
        { status: 400 }
      );
    }

    // @ts-ignore - ServiceCategory будет доступна после npx prisma generate
    const category = await prisma.serviceCategory.create({
      data: {
        name,
        slug,
        icon: icon || null,
        description: description || null,
        parent_id: parent_id || null,
        order: order || 0,
      },
      include: {
        children: true,
        parent: true,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create service category' },
      { status: 500 }
    );
  }
}
