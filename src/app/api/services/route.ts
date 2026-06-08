import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceCategoryId = searchParams.get('serviceCategoryId') || searchParams.get('categoryId');

    const where = serviceCategoryId
      ? { service_category_id: parseInt(serviceCategoryId) }
      : {};

    const services = await prisma.service.findMany({
      where,
      include: {
        serviceCategory: true,
        specialists: {
          include: {
            specialist: { include: { serviceCategory: true } },
          },
        },
        questions: true,
        feedbacks: true,
      },
      orderBy: { title: 'asc' },
    });

    const transformedServices = services.map((service) => ({
      ...service,
      specialists: service.specialists.map((ss) => ss.specialist),
    }));

    return NextResponse.json(transformedServices);
  } catch (error) {
    console.error('Services API error:', error);
    return NextResponse.json([], { status: 200 });
  }
}

