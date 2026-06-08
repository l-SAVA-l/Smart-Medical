import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceCategoryId = searchParams.get('serviceCategoryId') || searchParams.get('categoryId');
    const serviceCategorySlug = searchParams.get('serviceCategorySlug');

    let specialists;

    if (serviceCategorySlug) {
      const serviceCategory = await prisma.serviceCategory.findUnique({
        where: { slug: serviceCategorySlug },
        include: {
          children: { include: { children: true } },
        },
      });

      if (!serviceCategory) {
        return NextResponse.json([]);
      }

      const categoryIds = [serviceCategory.id];
      if (serviceCategory.children) {
        for (const child of serviceCategory.children) {
          categoryIds.push(child.id);
          if (child.children) {
            for (const grandchild of child.children) categoryIds.push(grandchild.id);
          }
        }
      }

      specialists = await prisma.specialist.findMany({
        where: {
          OR: [
            { service_category_id: { in: categoryIds } },
            {
              services: {
                some: {
                  service: { service_category_id: { in: categoryIds } },
                },
              },
            },
          ],
        },
        include: { serviceCategory: true },
        orderBy: { name: 'asc' },
      });
    } else if (serviceCategoryId) {
      specialists = await prisma.specialist.findMany({
        where: { service_category_id: parseInt(serviceCategoryId) },
        include: { serviceCategory: true },
        orderBy: { name: 'asc' },
      });
    } else {
      specialists = await prisma.specialist.findMany({
        include: { serviceCategory: true },
        orderBy: { name: 'asc' },
      });
    }

    return NextResponse.json(specialists);
  } catch (error) {
    console.error('Specialists API error:', error);
    return NextResponse.json([], { status: 200 });
  }
}

