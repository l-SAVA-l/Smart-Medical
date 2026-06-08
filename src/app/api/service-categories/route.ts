import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - получение категорий услуг верхнего уровня (без подкатегорий)
export async function GET() {
  try {
    // @ts-ignore - ServiceCategory будет доступна после npx prisma generate
    const categories = await prisma.serviceCategory.findMany({
      where: {
        is_active: true,
        parent_id: null, // Только корневые категории
      },
      orderBy: [
        { order: 'asc' },
        { name: 'asc' },
      ],
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching service categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service categories' },
      { status: 500 }
    );
  }
}
