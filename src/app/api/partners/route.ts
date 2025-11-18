import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');

    const where = categoryId ? { category_id: parseInt(categoryId) } : {};

    const partners = await prisma.partner.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        number: 'asc',
      },
    });

    return NextResponse.json(partners);
  } catch (error) {
    console.error('Error fetching partners:', error);
    return NextResponse.json(
      { error: 'Failed to fetch partners' },
      { status: 500 }
    );
  }
}

