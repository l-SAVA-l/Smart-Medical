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
        { error: 'Invalid vacancy ID' },
        { status: 400 }
      );
    }

    const vacancy = await prisma.vacancy.findUnique({
      where: { id },
    });

    if (!vacancy) {
      return NextResponse.json(
        { error: 'Vacancy not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(vacancy);
  } catch (error) {
    console.error('Error fetching vacancy:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vacancy' },
      { status: 500 }
    );
  }
}

