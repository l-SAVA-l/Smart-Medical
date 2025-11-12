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
        { error: 'Invalid specialist ID' },
        { status: 400 }
      );
    }

    const specialist = await prisma.specialist.findUnique({
      where: { id },
      include: {
        category: true,
        services: true,
      },
    });

    if (!specialist) {
      return NextResponse.json(
        { error: 'Specialist not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(specialist);
  } catch (error) {
    console.error('Error fetching specialist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch specialist' },
      { status: 500 }
    );
  }
}

