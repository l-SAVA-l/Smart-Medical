import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid service ID' },
        { status: 400 }
      );
    }

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        serviceCategory: true,
        specialists: {
          include: {
            specialist: {
              include: {
                serviceCategory: true,
              },
            },
          },
        },
        questions: true,
        feedbacks: {
          orderBy: {
            date: 'desc',
          },
        },
      },
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // Transform data to match expected format
    const transformedService = {
      ...service,
      specialists: service.specialists.map(ss => ss.specialist),
    };

    return NextResponse.json(transformedService);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch service' },
      { status: 500 }
    );
  }
}

