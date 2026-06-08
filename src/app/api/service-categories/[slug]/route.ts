import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - получить категорию по slug с услугами и подкатегориями
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const category = await prisma.serviceCategory.findFirst({
      where: {
        slug,
        is_active: true,
      },
      include: {
        children: {
          where: { is_active: true },
          orderBy: [
            { order: 'asc' },
            { name: 'asc' },
          ],
          include: {
            children: {
              where: { is_active: true },
              orderBy: [
                { order: 'asc' },
                { name: 'asc' },
              ],
            },
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    const collectCategoryIds = (node: typeof category): number[] => {
      const ids = [node.id];
      for (const child of node.children) {
        ids.push(...collectCategoryIds(child as typeof category));
      }
      return ids;
    };

    const categoryIds = collectCategoryIds(category);

    const services = await prisma.service.findMany({
      where: {
        service_category_id: { in: categoryIds },
      },
      orderBy: { title: 'asc' },
      include: {
        specialists: {
          include: {
            specialist: true,
          },
        },
        questions: {
          orderBy: { id: 'asc' },
        },
        feedbacks: {
          orderBy: { date: 'desc' },
        },
      },
    });

    return NextResponse.json({
      ...category,
      services,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Failed to fetch service category',
        details: error.message
      },
      { status: 500 }
    );
  }
}
