import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';

// GET - получить одну категорию по ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    // @ts-ignore - ServiceCategory будет доступна после npx prisma generate
    const category = await prisma.serviceCategory.findUnique({
      where: { id: parseInt(id) },
      include: {
        children: {
          orderBy: [
            { order: 'asc' },
            { name: 'asc' },
          ],
          include: {
            children: {
              orderBy: [
                { order: 'asc' },
                { name: 'asc' },
              ],
            },
          },
        },
        parent: true,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch service category' },
      { status: 500 }
    );
  }
}

// PUT - обновить категорию
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, icon, description, parent_id, order, is_active } = body;

    const { id: idStr } = await params;
    const id = parseInt(idStr);

    // Проверяем существование категории
    // @ts-ignore - ServiceCategory будет доступна после npx prisma generate
    const existing = await prisma.serviceCategory.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Если slug изменился, проверяем уникальность
    if (slug && slug !== existing.slug) {
      // @ts-ignore - ServiceCategory будет доступна после npx prisma generate
      const slugExists = await prisma.serviceCategory.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: 'Категория с таким slug уже существует' },
          { status: 400 }
        );
      }
    }

    // Проверяем уникальность order в пределах одного уровня (если order изменился)
    const newOrder = order !== undefined ? order : existing.order;
    const newParentId = parent_id !== undefined ? parent_id : existing.parent_id;

    if (newOrder !== existing.order || newParentId !== existing.parent_id) {
      // @ts-ignore - ServiceCategory будет доступна после npx prisma generate
      const orderExists = await prisma.serviceCategory.findFirst({
        where: {
          order: newOrder,
          parent_id: newParentId,
          id: { not: id }, // Исключаем текущую категорию
        },
      });

      if (orderExists) {
        return NextResponse.json(
          { error: `Порядок сортировки ${newOrder} уже занят другой категорией на этом уровне. Выберите другое значение.` },
          { status: 400 }
        );
      }
    }

    // Проверяем, чтобы категория не стала своим родителем
    if (parent_id === id) {
      return NextResponse.json(
        { error: 'Категория не может быть своим родителем' },
        { status: 400 }
      );
    }

    // @ts-ignore - ServiceCategory будет доступна после npx prisma generate
    const category = await prisma.serviceCategory.update({
      where: { id },
      data: {
        name: name || existing.name,
        slug: slug || existing.slug,
        icon: icon !== undefined ? icon : existing.icon,
        description: description !== undefined ? description : existing.description,
        parent_id: parent_id !== undefined ? parent_id : existing.parent_id,
        order: order !== undefined ? order : existing.order,
        is_active: is_active !== undefined ? is_active : existing.is_active,
      },
      include: {
        children: true,
        parent: true,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update service category' },
      { status: 500 }
    );
  }
}

// DELETE - удалить категорию
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: idStr } = await params;
    const id = parseInt(idStr);

    // Проверяем существование категории
    // @ts-ignore - ServiceCategory будет доступна после npx prisma generate
    const category = await prisma.serviceCategory.findUnique({
      where: { id },
      include: {
        children: true,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Удаляем категорию (каскадно удалятся и дочерние)
    // @ts-ignore - ServiceCategory будет доступна после npx prisma generate
    await prisma.serviceCategory.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete service category' },
      { status: 500 }
    );
  }
}
